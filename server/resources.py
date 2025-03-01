import requests
import json
from groq import Groq
from bs4 import BeautifulSoup
import webbrowser
import os
from dotenv import load_dotenv

load_dotenv('.env', override=True)
GROQ_RESTUDY_RESOURCES = os.getenv('GROQ_RESTUDY_RESOURCES')
if not GROQ_RESTUDY_RESOURCES:
    raise ValueError("No se ha encontrado la clave GROQ_TOKEN_RESOURCES en el archivo .env")

class TextAnalyzer:
    def __init__(self):
        self.api_key = GROQ_RESTUDY_RESOURCES
        self.client = Groq(api_key=self.api_key)
        
    def generate_summary(self, text):
        """
        Genera un resumen de una frase usando la API de Groq
        """
        try:
            prompt = f"Resume el siguiente texto en una frase corta para buscar más sobre el tema en google: {text}"
            
            completion = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",  # Puedes cambiar el modelo según disponibilidad
                messages=[
                    {"role": "system", "content": "Eres un asistente especializado en buscar recursos educativos en línea mediante búsquedas en Google. Ejemplo de interacción: Texto: 'La inteligencia artificial (IA) es una rama de la informática que se centra en desarrollar sistemas capaces de realizar tareas que normalmente requieren inteligencia humana' Respuesta: 'Qué es la inteligencia artificial'"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.7
            )
            
            summary = completion.choices[0].message.content
            return summary.strip()
            
        except Exception as e:
            return f"Error al generar resumen: {str(e)}"
    
    def search_resources(self, query):
        """
        Busca recursos en internet basados en el resumen
        """
        try:
            search_url = f"https://www.google.com/search?q={query}+recursos+para+aprender+site:*.edu|site:*.org|site:*.gov+-inurl:(login | signup)"
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            resources = []
            for item in soup.select('div.g')[:5]:
                title = item.select_one('h3')
                link = item.select_one('a')
                if title and link:
                    resources.append({
                        "title": title.text,
                        "url": link['href']
                    })
            
            return resources
            
        except Exception as e:
            return f"Error en la búsqueda: {str(e)}"
    
    def analyze_text(self, text):
        """
        Función principal que analiza el texto y busca recursos
        """
        print("1. Generando resumen...")
        summary = self.generate_summary(text)
        print(f"Resumen generado: {summary}\n")
        
        print("2. Buscando recursos relevantes...")
        resources = self.search_resources(summary)
        
        print("Recursos encontrados:")
        if isinstance(resources, str):
            print(resources)
        else:
            for i, resource in enumerate(resources, 1):
                print(f"{i}. {resource['title']}")
                print(f"   URL: {resource['url']}\n")
            
            if resources:
                print("¿Desea abrir el primer recurso en su navegador? (s/n)")
                choice = input().lower()
                if choice == 's':
                    webbrowser.open(resources[0]['url'])
        
        return summary, resources

if __name__ == "__main__":
    sample_text = """
    La inteligencia artificial (IA) es una rama de la informática que se centra en desarrollar 
    sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, como 
    el aprendizaje, la resolución de problemas y la toma de decisiones. En los últimos años, 
    la IA ha avanzado significativamente gracias al aprendizaje automático y las redes 
    neuronales profundas.
    """
    
    analyzer = TextAnalyzer()

    print("Iniciando análisis del texto...\n")
    summary, resources = analyzer.analyze_text(sample_text)