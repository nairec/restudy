import graphviz
import hashlib
import math
import colorsys
import os
import base64

def generate_mind_map(data, output_filename="mind_map", dpi=300):
    """
    Generate a high-resolution mind map using Graphviz with support for nested subcategories.
    """
    g = graphviz.Digraph('mind_map', format='png')
    g.attr(rankdir='LR', size='12,8', bgcolor='#1E1E1E', fontcolor='white', 
           fontname='Arial', margin='0.2', overlap='false', splines='true', dpi=str(dpi))
    g.attr('node', shape='box', style='rounded,filled', fillcolor='#2A2A2A',
           color='#2A2A2A', fontcolor='white', fontname='Arial', fontsize='14',
           margin='0.4,0.3', height='0.6', width='3.0', penwidth='1.5')
    g.attr('edge', color='#666666', fontcolor='white', fontname='Arial', fontsize='12', 
           penwidth='1.5', len='0.05')

    def generate_id(text):
        return "node_" + hashlib.md5(text.encode('utf-8')).hexdigest()[:8]

    def generate_colors(num_categories):
        return ["#{:02x}{:02x}{:02x}".format(*[int(c * 255) for c in colorsys.hsv_to_rgb(i / num_categories, 0.7, 0.6)]) for i in range(num_categories)]

    def create_nodes(parent_id, items, color):
        for item in items:
            node_id = generate_id(item['text'])
            g.node(node_id, f"{item['text']}\n\n{item['description']}", fillcolor=color, color=color)
            g.edge(parent_id, node_id)
            
            if 'subcategories' in item:
                create_nodes(node_id, item['subcategories'], color)
    
    center_id = 'center'
    g.node(center_id, f"{data['title']['text']}\n\n{data['title']['description']}", 
           shape='box', style='rounded,filled', fillcolor='#3B4C8A', color='#3B4C8A', 
           fontcolor='white', fontsize='18', width='3.5', height='1.5', penwidth='2')
    
    categories = data['categories']
    colors = generate_colors(len(categories))
    
    for i, category in enumerate(categories):
        category_id = generate_id(category['text'])
        g.node(category_id, f"{category['text']}\n\n{category['description']}", fillcolor=colors[i], color=colors[i], fontsize='16')
        g.edge(center_id, category_id, penwidth='2.0')
        
        if 'subcategories' in category:
            create_nodes(category_id, category['subcategories'], colors[i])
    
    g.attr(layout='neato')
    temp_path = g.render(output_filename, format='png', cleanup=True)

    with open(temp_path, 'rb') as f:
        encoded_string = base64.b64encode(f.read()).decode('utf-8')
    os.remove(temp_path)
    return encoded_string

if __name__ == "__main__":
    test_data = {
        'title': {
            'text': 'Expanded Mind Map',
            'description': 'An example with more than 4 categories'
        },
        'categories': [
            {
                'text': 'Category 1',
                'description': 'Description for Category 1',
                'subcategories': [
                    {'text': 'Subcategory 1.1', 'description': 'Description 1.1'},
                    {'text': 'Subcategory 1.2', 'description': 'Description 1.2'}
                ]
            },
            {
                'text': 'Category 2',
                'description': 'Description for Category 2',
                'subcategories': [
                    {'text': 'Subcategory 2.1', 'description': 'Description 2.1'},
                    {'text': 'Subcategory 2.2', 'description': 'Description 2.2'}
                ]
            },
            {
                'text': 'Category 3',
                'description': 'Description for Category 3',
                'subcategories': [
                    {'text': 'Subcategory 3.1', 'description': 'Description 3.1'},
                    {'text': 'Subcategory 3.2', 'description': 'Description 3.2'}
                ]
            },
            {
                'text': 'Category 4',
                'description': 'Description for Category 4',
                'subcategories': [
                    {'text': 'Subcategory 4.1', 'description': 'Description 4.1'}
                ]
            },
            {
                'text': 'Category 5',
                'description': 'Description for Category 5',
                'subcategories': [
                    {'text': 'Subcategory 5.1', 
                     'description': 'Description 5.1',
                     'subcategories': [
                        {'text': 'Subcategory 5.1.1', 'description': 'Description 5.1.1'},
                        {'text': 'Subcategory 5.1.2', 'description': 'Description 5.1.2'}
                    ]},
                    {'text': 'Subcategory 5.2', 'description': 'Description 5.2'}
                ]
            },
        
        ]
    }
    
    output_path = generate_mind_map(test_data, "nested_mind_map")
    print(f"Mind map generated: {output_path}")
