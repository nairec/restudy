from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Annotated, Union
from PyPDF2 import PdfReader
from docx import Document
import io
import os
import groq
from groq import Groq, RateLimitError
import json
import ast
import networkx as nx
import matplotlib.pyplot as plt
from itertools import combinations
import base64
import re
from dotenv import load_dotenv
from PIL import Image
from pdf2image import convert_from_bytes
import easyocr
import numpy as np
import fitz
from mindmap import generate_mind_map

app = FastAPI()
load_dotenv('.env')
PORT = os.getenv('PORT')

GROQ_TOKEN_SUMMARY = os.getenv('GROQ_RESTUDY_SUMMARY')
GROQ_TOKEN_QUESTIONS = os.getenv('GROQ_RESTUDY_QUESTIONS')
GROQ_TOKEN_MINDMAP = os.getenv('GROQ_RESTUDY_MINDMAP')
GROQ_TOKEN_RESOURCES = os.getenv('GROQ_RESTUDY_RESOURCES')

summary_client = Groq(api_key=GROQ_TOKEN_SUMMARY)
questions_client = Groq(api_key=GROQ_TOKEN_QUESTIONS)
mindmap_client = Groq(api_key=GROQ_TOKEN_MINDMAP)

class TextInput(BaseModel):
    text: str
    summary_length: str
    question_number: str
    question_difficulty: str
    analysis_type: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return None

@app.post("/analyze-content")
async def analyze_content(
    text: Annotated[str | None, Form()] = None,
    document: UploadFile | None = None,
    summary_length: str = Form(...),
    question_number: str = Form(...),
    question_difficulty: str = Form(...),
    analysis_type: str = Form(...)
):
    if document:
        content = get_doc_content(document)
    elif text:
        content = text
    else:
        raise ValueError("Either text or document must be provided")
        
    return await process_content(
        content,
        summary_length,
        question_number,
        question_difficulty,
        analysis_type
    )

def get_doc_content(doc: UploadFile = File(...)):

    doc_content = ""
    fileBytes = doc.file.read()
    if doc.filename.endswith('.pdf'):
        pdf_reader = PdfReader(io.BytesIO(fileBytes))
        for page_num, page in enumerate(pdf_reader.pages):
        # Try to extract text directly (for selectable text)
            page_text = page.extract_text()
            if page_text and page_text.strip():
                doc_content += page_text
            else:
                pdf_document = fitz.open(stream=fileBytes, filetype="pdf")
                page = pdf_document.load_page(page_num)
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes()))
                
                # Perform OCR using EasyOCR
                reader = easyocr.Reader(['en','es'])  # Specify languages here
                ocr_result = reader.readtext(np.array(img))
                ocr_text = " ".join([result[1] for result in ocr_result])  # Extract text from OCR result
                doc_content += ocr_text
    elif doc.filename.endswith('.docx'):
        doc = Document(io.BytesIO(fileBytes))
        for paragraph in doc.paragraphs:
            doc_content += paragraph.text + "\n"
    elif doc.filename.endswith('.txt'):
        doc_content = fileBytes
    else:
        raise ValueError("Unsupported file format")

    return doc_content
    
async def get_summary(content: str, length: str):
    try:
        chat_completion = summary_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are an experienced educational assistant with a deep understanding of various subjects and a talent for breaking down complex information into digestible summaries. Your expertise lies in creating summaries that not only condense information but also enhance the student's comprehension and retention of the topic. Your task is to summarize a given text in a way that facilitates the student's learning. Please keep in mind the following aspects while summarizing: - Focus on the key concepts and main ideas.- Use clear and straightforward language suitable for students.- Highlight any important terminology or definitions.- Incorporate examples or analogies if they would aid in understanding. - Your response must be the closest possible to the following length: {length} words and must ONLY contain the summary - DO NOT include any phrase like 'Here is the summary:'."
                },
                {
                    "role": "user",
                    "content": f"TEXT TO SUMMARIZE: {content}",
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
        )
        return chat_completion.choices[0].message.content
    except groq.RateLimitError:
        # Fallback to alternative model
        chat_completion = summary_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are an experienced educational assistant with a deep understanding of various subjects and a talent for breaking down complex information into digestible summaries. Your expertise lies in creating summaries that not only condense information but also enhance the student's comprehension and retention of the topic. Your task is to summarize a given text in a way that facilitates the student's learning. Please keep in mind the following aspects while summarizing: - Focus on the key concepts and main ideas.- Use clear and straightforward language suitable for students.- Highlight any important terminology or definitions.- Incorporate examples or analogies if they would aid in understanding. - Your response must be the closest possible to the following length: {length} words and must ONLY contain the summary - DO NOT include any phrase like 'Here is the summary:'."
                },
                {
                    "role": "user",
                    "content": f"TEXT TO SUMMARIZE: {content}",
                }
            ],
            model="llama-70b-8192",
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return "There has been an error summarizing the document." + str(e)

async def get_questions(content: str, question_number: str, question_difficulty: str):
    try:
        chat_completion = questions_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced educational consultant with a deep understanding of effective learning strategies and critical thinking techniques. Your specialty lies in generating insightful questions that encourage deeper engagement with the material and help students expand their knowledge. Your task is to generate smart questions related to a given text to facilitate student learning. Here are the details you need to keep in mind: - The questions should have the following difficulty: " + question_difficulty + " ('varied' difficulty means a set of easy, moderate and hard questions and 'Further research required' means that the user should not be able to answer the questions without researching other sources). - Aim for exactly " + question_number + " questions that cover different aspects of the text, such as themes, character motivations, implications, and real-world applications. - ALWAYS answer with a json-like structured output EXACTLY like the following: {'questions': ['question1','question2'], 'answers': ['answer1','answer2']}"
                },
                {
                    "role": "user",
                    "content": f"TEXT TO GENERATE QUESTIONS FROM: {content}",
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
        )
        return ast.literal_eval(chat_completion.choices[0].message.content)
    except groq.RateLimitError:
        # Fallback to alternative model
        chat_completion = questions_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced educational consultant with a deep understanding of effective learning strategies and critical thinking techniques. Your specialty lies in generating insightful questions that encourage deeper engagement with the material and help students expand their knowledge. Your task is to generate smart questions related to a given text to facilitate student learning. Here are the details you need to keep in mind: - The questions should have the following difficulty: " + question_difficulty + " ('varied' difficulty means a set of easy, moderate and hard questions and 'Further research required' means that the user should not be able to answer the questions without researching other sources). - Aim for exactly " + question_number + " questions that cover different aspects of the text, such as themes, character motivations, implications, and real-world applications. - ALWAYS answer with a json-like structured output EXACTLY like the following: {'questions': ['question1','question2'], 'answers': ['answer1','answer2']}"
                },
                {
                    "role": "user",
                    "content": f"TEXT TO GENERATE QUESTIONS FROM: {content}",
                }
            ],
            model="llama-70b-8192",
            temperature=0.5,
            max_completion_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
        )
        return ast.literal_eval(chat_completion.choices[0].message.content)   
    except Exception as e:
        return "There has been an error generating questions."

async def get_mindmap(text: str):
    system_prompt = """You are an expert in conceptual analysis and mind map creation. Follow these instructions precisely:

                    1. Analyze the provided text and identify the most important key cateogries. DO NOT insert more than 5 categories
                    2. Determine meaningful relationships between these concepts
                    3. Maintain a clear hierarchical structure when appropriate
                    4. Keep titles concise (maximum 5 words)
                    5. Descriptions should explain and elaborate their corresponding titles
                    6. Ensure all concepts are connected in a coherent network
                    7. Prioritize causal relationships over simple associations
                    8. Avoid superposition or repetition of concepts 

                    Return ONLY a valid JSON object with this exact structure:
                    {
                        'title': {
                            'text': 'Expanded Mind Map',
                            'description': 'An example of mindmap'
                        },
                        'categories': [
                            {
                                'text': 'Category 1',
                                'description': 'Description for Category 1',
                                'subcategories': [
                                    {'text': 'Subcategory 1.1', 'description': 'Description 1.1'},
                                    {'text': 'Subcategory 1.2', 'description': 'Description 1.2'}
                                ]
                            }
                        ]
                    }

                    Important rules:
                    - ALWAYS Answer in the language of the given text
                    - You can add up to 5 categories and up to 3 subcategories per category
                    - You can add up to 3 levels of subcategories (e.g., Category 1 -> Subcategory 1.1 -> Subcategory 1.1.1)
                    - It is not necessary that all categories have the same number of subcategories
                    - DO NOT include markdown syntax (important) or additional explanations
                    - Ensure JSON is properly formatted and valid
                    - Maintain consistent relationship directionality
                    - Avoid circular references unless absolutely necessary"""

    # Llamada a la API de Groq
    try:
        response = mindmap_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f'{text}'}
            ],
            temperature=0.3,
            max_tokens=1024
        )
    except groq.RateLimitError:
        # Fallback to alternative model
        response = mindmap_client.chat.completions.create(
            model="llama-70b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f'{text}'}
            ],
            temperature=0.3,
            max_tokens=1024
        )
    
    # Extraer y parsear la respuesta JSON
    try:
        response = re.sub(r'```json\s*|\s*```', '', response.choices[0].message.content)
        mindmap_data = ast.literal_eval(response)
    except (AttributeError, json.JSONDecodeError) as e:
        raise ValueError("Error parsing model response") from e

    mindmap_img = generate_mind_map(mindmap_data)
    
    return mindmap_img

async def process_content(content: str, summary_length: str, question_number: str, question_difficulty: str, analysis_type: str):
    summary = ""
    questions = {}
    mindmap = ""
    resources = []

    if "summary" in analysis_type:
        summary = await get_summary(content, summary_length)
    if "questions" in analysis_type:
        questions = await get_questions(content, question_number, question_difficulty)
    if "mindmap" in analysis_type:
        mindmap = await get_mindmap(content)
    
    return {
        "summary": summary,
        "mindmap": mindmap,
        "questions": questions.get('questions', []),
        "answers": questions.get('answers', []),
        "resources": resources
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="0.0.0.0", port=PORT)
