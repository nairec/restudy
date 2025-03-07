import json
import re
from urllib.parse import quote_plus
from groq import Groq
from dotenv import load_dotenv
import os
from googleapiclient.discovery import build


async def text_to_search_links(text, groq_api_key, google_api_key, google_cse_id, max_results=5):
    """
    Convert a long text to a Google search phrase using Groq API,
    then search for relevant resources and return a list of links.
    
    Args:
        text (str): The input text to analyze
        groq_api_key (str): Your Groq API key
        max_results (int, optional): Maximum number of links to return. Defaults to 5.
        
    Returns:
        list: A list of relevant URLs
    """
    # Step 1: Generate search phrase with Groq API
    search_phrase = generate_search_phrase_with_groq(text, groq_api_key)
    
    # Step 2: Perform Google search with the generated phrase
    search_results = google_search(search_phrase, google_api_key, google_cse_id, max_results)
    
    return search_results

def generate_search_phrase_with_groq(text, api_key):
    """
    Use Groq API to generate a concise search phrase from text.
    
    Args:
        text (str): The input text to analyze
        api_key (str): Your Groq API key
        
    Returns:
        str: A search phrase suitable for Google
    """
    if len(text) > 8000:
        text = text[:8000] + "..."
    
    client = Groq(api_key=api_key)
    
    prompt = f"""
    I need to convert the following text into a concise and effective Google search query. 
    The query should capture the key concepts and questions from the text that would lead 
    to finding relevant, high-quality resources for deeper investigation.
    Please ensure that the query does not contain indicators like "AND", "OR", or parentheses.
    
    Text to analyze:
    {text}
    
    Please generate ONLY the search query, without any explanation or additional text.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates effective search queries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=100
        )
        
        search_phrase = chat_completion.choices[0].message.content.strip()
        
        search_phrase = re.sub(r'^["\']|["\']$', '', search_phrase) 
        search_phrase = search_phrase.split("\n")[0]
        
        return search_phrase
    
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        # Fallback: extract keywords if API fails
        words = re.findall(r'\b\w{4,}\b', text.lower())
        word_freq = {}
        for word in words:
            if word in word_freq:
                word_freq[word] += 1
            else:
                word_freq[word] = 1
        
        # Get the most frequent 5-7 words
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        top_words = [word for word, _ in sorted_words[:6]]
        return " ".join(top_words)
    
def google_search(query, api_key, cse_id, max_results=5):
    """
    Perform a Google search using the Custom Search API.
    
    Args:
        query (str): The search query
        api_key (str): Google API key
        cse_id (str): Google Custom Search Engine ID
        max_results (int): Maximum number of results to return
        
    Returns:
        list: A list of URLs
    """
    try:
        service = build("customsearch", "v1", developerKey=api_key)
        
        result = service.cse().list(
            q=query,
            cx=cse_id,
            num=max_results
        ).execute()
        
        links = []
        if 'items' in result:
            for item in result['items']:
                links.append(item['link'])
        
        return links
    
    except Exception as e:
        print(f"Error performing Google search: {e}")
        return []


# Example usage:
if __name__ == "__main__":
    sample_text = """
    Each neuron is made up of a cell body (the central mass of the cell) with a number of connections coming off it: numerous dendrites (the cell's inputs—carrying information toward the cell body) and a single axon (the cell's output—carrying information away). Neurons are so tiny that you could pack about 100 of their cell bodies into a single millimeter. (It's also worth noting, briefly in passing, that neurons make up only 10–50 percent of all the cells in the brain; the rest are glial cells, also called neuroglia, that support and protect the neurons and feed them with energy that allows them to work and grow.) [1] Inside a computer, the equivalent to a brain cell is a nanoscopically tiny switching device called a transistor. The latest, cutting-edge microprocessors (single-chip computers) contain over 50 billion transistors; even a basic Pentium microprocessor from about 20 years ago had about 50 million transistors, all packed onto an integrated circuit just 25mm square (smaller than a postage stamp)
That's where the comparison between computers and brains begins and ends, because the two things are completely different. It's not just that computers are cold metal boxes stuffed full of binary numbers, while brains are warm, living, things packed with thoughts, feelings, and memories. The real difference is that computers and brains "think" in completely different ways. The transistors in a computer are wired in relatively simple, serial chains (each one is connected to maybe two or three others in basic arrangements known as logic gates), whereas the neurons in a brain are densely interconnected in complex, parallel ways (each one is connected to perhaps 10,000 of its neighbors).
    """
    
    load_dotenv()
    groq_api_key = os.getenv('GROQ_RESTUDY_RESOURCES')
    google_api_key = os.getenv('GOOGLE_SEARCH_KEY')
    google_cse_id = os.getenv('GOOGLE_SEARCH_ID') 
    results = text_to_search_links(sample_text, groq_api_key, google_api_key, google_cse_id)
    
    print("Search results:")
    for i, url in enumerate(results, 1):
        print(f"{i}. {url}")