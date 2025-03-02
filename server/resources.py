import json
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
from groq import Groq
from dotenv import load_dotenv
import os

async def text_to_search_links(text, groq_api_key, max_results=5):
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
    print(f"Generated search phrase: {search_phrase}")
    
    # Step 2: Perform Google search with the generated phrase
    search_results = duckduckgo_search(search_phrase, max_results)
    
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

def duckduckgo_search(query, max_results=5):
    """
    Perform a DuckDuckGo search using their lite version which is easier to parse.
    
    Args:
        query (str): The search query
        max_results (int): Maximum number of results to return
        
    Returns:
        list: A list of URLs
    """
    search_url = f"https://lite.duckduckgo.com/lite/?q={quote_plus(query)}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        links = []
        for a_tag in soup.select('a.result-link'):
            href = a_tag.get('href')
            if href and href.startswith('http'):
                links.append(href)
                if len(links) >= max_results:
                    break
        
        return links
    
    except Exception as e:
        print(f"Error performing DuckDuckGo search: {e}")
        return []

# Example usage:
if __name__ == "__main__":
    sample_text = """
    La Revolución Francesa: Un Análisis Exhaustivo
Introducción
La Revolución Francesa (1789-1799) fue un período de profundos cambios políticos, sociales y económicos que transformó no solo a Francia, sino que también tuvo un impacto significativo en el mundo entero. Este evento histórico marcó el fin del Antiguo Régimen y el inicio de la era moderna, caracterizada por la expansión de los ideales de libertad, igualdad y fraternidad. En este análisis, exploraremos las causas, el desarrollo, las consecuencias y la importancia contemporánea de la Revolución Francesa.

Causas de la Revolución Francesa
1. Crisis Económica:

Déficit Fiscal: Francia enfrentaba una grave crisis financiera debido a los gastos excesivos de la corte real, las guerras costosas (como la Guerra de los Siete Años y la participación en la Guerra de Independencia de los Estados Unidos), y un sistema fiscal ineficiente.

Desigualdad Fiscal: La nobleza y el clero estaban exentos de muchos impuestos, lo que colocaba una carga desproporcionada sobre el Tercer Estado, compuesto principalmente por campesinos y burgueses.

2. Crisis Social:

Estructura Social Rígida: La sociedad francesa estaba dividida en tres estamentos: el Primer Estado (clero), el Segundo Estado (nobleza) y el Tercer Estado (el resto de la población). Esta estructura perpetuaba la desigualdad y la injusticia.

Descontento Popular: El Tercer Estado, que representaba alrededor del 98% de la población, sufría de pobreza, hambre y falta de representación política.

3. Crisis Política:

Monarquía Absoluta: El rey Luis XVI ejercía un poder absoluto, lo que generaba descontento entre aquellos que buscaban reformas políticas y una mayor participación en el gobierno.

Influencia de las Ideas Ilustradas: Filósofos como Voltaire, Rousseau y Montesquieu promovieron ideas de democracia, separación de poderes y derechos individuales, que inspiraron a muchos a cuestionar el status quo.

4. Crisis Agrícola:

Malas Cosechas: Una serie de malas cosechas en la década de 1780 llevó a una escasez de alimentos y al aumento de los precios, exacerbando el malestar social.

Desarrollo de la Revolución
1. Convocatoria de los Estados Generales (1789):

En un intento por resolver la crisis financiera, Luis XVI convocó a los Estados Generales, una asamblea representativa de los tres estamentos. Sin embargo, las tensiones entre los estamentos llevaron a la formación de la Asamblea Nacional por parte del Tercer Estado.

2. Toma de la Bastilla (14 de julio de 1789):

Este evento simbólico marcó el inicio de la Revolución. La toma de la Bastilla, una prisión real y símbolo del poder absolutista, por parte de los revolucionarios, fue un punto de inflexión en la lucha contra la monarquía.

3. Abolición del Feudalismo (4 de agosto de 1789):

La Asamblea Nacional abolió los privilegios feudales, eliminando los derechos señoriales y las cargas fiscales sobre los campesinos.

4. Declaración de los Derechos del Hombre y del Ciudadano (26 de agosto de 1789):

Este documento fundamental proclamó los principios de libertad, igualdad y fraternidad, y sentó las bases para una sociedad basada en los derechos individuales y la soberanía popular.

5. Constitución de 1791:

La primera constitución francesa estableció una monarquía constitucional, limitando los poderes del rey y estableciendo una asamblea legislativa electa.

6. Ejecución de Luis XVI (21 de enero de 1793):

El rey fue juzgado por traición y ejecutado, lo que marcó el fin de la monarquía y el inicio de la Primera República Francesa.

7. El Reinado del Terror (1793-1794):

Bajo el liderazgo de Maximilien Robespierre y el Comité de Salvación Pública, el gobierno revolucionario llevó a cabo una serie de ejecuciones masivas para eliminar a los enemigos de la revolución. Este período estuvo marcado por la violencia y la paranoia.

8. Golpe de Estado del 18 de Brumario (9 de noviembre de 1799):

Napoleón Bonaparte dio un golpe de estado que puso fin al Directorio y estableció el Consulado, marcando el fin de la Revolución Francesa y el inicio de la era napoleónica.

Consecuencias de la Revolución Francesa
1. Políticas:

Fin del Antiguo Régimen: La Revolución puso fin a la monarquía absoluta y estableció principios republicanos y democráticos.

Expansión de los Derechos Civiles: La Declaración de los Derechos del Hombre y del Ciudadano sentó las bases para los derechos humanos modernos.

Nacionalismo: La Revolución fomentó el sentimiento nacionalista y la idea de que el poder reside en la nación, no en un monarca.

2. Sociales:

Abolición de los Privilegios: Se eliminaron los privilegios de la nobleza y el clero, promoviendo una mayor igualdad social.

Educación y Secularización: Se promovió la educación pública y la separación entre la Iglesia y el Estado.

3. Económicas:

Reforma Agraria: La abolición del feudalismo permitió una mayor distribución de la tierra y la modernización de la agricultura.

Libertad Económica: Se promovió la libre empresa y se eliminaron muchas restricciones comerciales.

4. Internacionales:

Guerras Revolucionarias: La Revolución llevó a una serie de conflictos con otras potencias europeas, que temían la expansión de las ideas revolucionarias.

Influencia Global: Los ideales de la Revolución inspiraron movimientos independentistas y revolucionarios en América Latina, Europa y otras partes del mundo.

Importancia de la Revolución Francesa en la Actualidad
1. Legado de los Derechos Humanos:

La Declaración de los Derechos del Hombre y del Ciudadano sigue siendo un documento fundamental en la historia de los derechos humanos y ha influido en numerosas constituciones y declaraciones internacionales.

2. Democracia y Participación Ciudadana:

La Revolución Francesa sentó las bases para los sistemas democráticos modernos, enfatizando la importancia de la participación ciudadana y la soberanía popular.

3. Igualdad y Justicia Social:

Los principios de igualdad ante la ley y la lucha contra los privilegios heredados siguen siendo relevantes en las discusiones contemporáneas sobre justicia social y equidad.

4. Nacionalismo y Ciudadanía:

La idea de que el poder reside en la nación y no en un monarca ha influido en la formación de estados-nación y en el concepto de ciudadanía.

5. Secularismo y Libertad Religiosa:

La separación entre la Iglesia y el Estado promovida por la Revolución sigue siendo un principio fundamental en muchas sociedades modernas.

6. Educación y Cultura:

La promoción de la educación pública y la cultura como herramientas para la emancipación y el progreso social sigue siendo un legado importante de la Revolución.

Reflexiones Finales
La Revolución Francesa fue un evento complejo y multifacético que transformó profundamente a Francia y al mundo. Aunque estuvo marcada por momentos de gran violencia y conflicto, sus logros en términos de derechos humanos, democracia y justicia social son innegables. Los ideales de libertad, igualdad y fraternidad que emergieron de la Revolución siguen siendo relevantes hoy en día, inspirando luchas por la justicia y la igualdad en todo el mundo.

Sin embargo, la Revolución también nos recuerda los desafíos y los peligros que acompañan a los cambios radicales. El Reinado del Terror, en particular, es un recordatorio de cómo los ideales más nobles pueden ser distorsionados por el fanatismo y la paranoia.

En última instancia, la Revolución Francesa nos enseña que la lucha por la libertad y la justicia es un proceso continuo y que los logros del pasado deben ser protegidos y ampliados en el presente. Como tal, su estudio no solo es esencial para entender nuestra historia, sino también para informar nuestras acciones futuras en la búsqueda de un mundo más justo y equitativo.
    """
    
    load_dotenv()
    groq_api_key = os.getenv('GROQ_RESTUDY_RESOURCES') 
    results = text_to_search_links(sample_text, groq_api_key)
    
    print("Search results:")
    for i, url in enumerate(results, 1):
        print(f"{i}. {url}")