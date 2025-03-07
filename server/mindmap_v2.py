#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Enhanced Mind Map Generator Script for React Integration

This script generates interactive mind maps from hierarchical data structures,
providing PNG output optimized for React frontend integration.

Usage:
    python mindmap_generator.py --input data.json --output mindmap --theme dark --layout radial

Dependencies:
    - graphviz
    - colorsys
    - hashlib
    - json
    - base64
    - os
"""

import graphviz
import colorsys
import hashlib
import json
import base64
import os
import argparse
from typing import Dict, List, Tuple, Any, Optional


class MindMapGenerator:
    """
    Mind Map Generator class that creates visualizations from hierarchical data
    optimized for React frontend integration.
    """

    def __init__(self):
        # Define theme colors that match the React component
        self.themes = {
            "dark": {
                "bg": "#191825", 
                "node": "#2A2A2A", 
                "text": "white",
                "center": "#00FF9C",
                "edge": "#666666"
            },
            "light": {
                "bg": "#FFFFFF", 
                "node": "#F0F0F0", 
                "text": "#333333",
                "center": "#00FF9C",
                "edge": "#AAAAAA"
            },
            "green": {
                "bg": "#191825", 
                "node": "#2A2A2A", 
                "text": "#00FF9C",
                "center": "#00FF9C",
                "edge": "#00FF9C50"
            }
        }

    def generate_id(self, text: str) -> str:
        """Generate a unique ID for a node based on its text content."""
        return "node_" + hashlib.md5(text.encode('utf-8')).hexdigest()[:8]

    def generate_colors(self, num_categories: int, base_hue: Optional[float] = None) -> List[str]:
        """
        Generate a color palette for the mind map categories.
        
        Args:
            num_categories: Number of colors to generate
            base_hue: Optional base hue to generate variations from
            
        Returns:
            List of hex color codes
        """
        if base_hue is None:
            # Generate evenly distributed colors
            return ["#{:02x}{:02x}{:02x}".format(
                *[int(c * 255) for c in colorsys.hsv_to_rgb(i / max(1, num_categories), 0.7, 0.6)]
            ) for i in range(num_categories)]
        else:
            # Generate colors with similar hue but different saturation/value
            return ["#{:02x}{:02x}{:02x}".format(
                *[int(c * 255) for c in colorsys.hsv_to_rgb(base_hue + (i * 0.05), 0.5 + (i * 0.1), 0.6)]
            ) for i in range(num_categories)]

    def create_nodes(self, g: graphviz.Digraph, parent_id: str, items: List[Dict], 
                     color: str, metadata: Dict[str, List[str]], level: int = 1) -> None:
        """
        Recursively create nodes and edges for the mind map.
        
        Args:
            g: Graphviz graph to add nodes to
            parent_id: ID of the parent node
            items: List of items to create nodes for
            color: Color for the nodes
            metadata: Dictionary to store node relationships and IDs
            level: Current depth level in the hierarchy
        """
        for item in items:
            node_id = self.generate_id(item['text'])
            metadata["all_nodes"].append(node_id)
            
            # If this is a child of a node, record the relationship
            if parent_id != "center":
                metadata["node_relationships"].append((parent_id, node_id))
            
            # Font size decreases slightly with depth
            font_size = max(12, 16 - (level * 0.5))
            
            # Add tooltip with full description
            tooltip = item['description'].replace('"', '\'')
            
            # Create node with HTML-like label for better formatting
            label = f"<<table border='0' cellpadding='5'><tr><td><b>{item['text']}</b></td></tr>"
            
            # Only show truncated description in the node
            if len(item['description']) > 60:
                description = item['description'][:57] + "..."
            else:
                description = item['description']
                
            label += f"<tr><td>{description}</td></tr></table>>"
            
            g.node(node_id, label, fillcolor=color, color=color, fontsize=str(font_size), 
                   tooltip=tooltip)
            
            # Add edge with custom attributes
            g.edge(parent_id, node_id, tooltip=f"Connection: {item['text']}")
            
            if 'subcategories' in item and item['subcategories']:
                # Generate a similar but distinct color for subcategories
                sub_hue = colorsys.rgb_to_hsv(*[int(color[i:i+2], 16)/255 for i in (1, 3, 5)])[0]
                self.create_nodes(g, node_id, item['subcategories'], color, metadata, level+1)

    def generate_mind_map(self, data: Dict, output_filename: str = "mind_map", 
                          dpi: int = 300, theme: str = "dark", 
                          layout: str = "radial") -> Dict[str, str]:
        """
        Generate a mind map using Graphviz optimized for React integration.
        
        Args:
            data: The hierarchical data structure for the mind map
            output_filename: Base filename for the output
            dpi: Resolution of the generated image
            theme: Visual theme ('dark', 'light', 'green')
            layout: Layout algorithm ('radial', 'horizontal', 'vertical', 'force')
            
        Returns:
            Dictionary with base64-encoded PNG data and metadata
        """
        # Get theme colors
        current_theme = self.themes.get(theme, self.themes["dark"])
        
        # Set layout direction
        if layout == "horizontal":
            rankdir = "LR"
        elif layout == "vertical":
            rankdir = "TB"
        elif layout == "radial" or layout == "force":
            rankdir = ""
        else:
            rankdir = "LR"  # Default
        
        # Create graph with appropriate layout engine
        engine = "neato" if layout in ["radial", "force"] else "dot"
        g = graphviz.Digraph('mind_map', format='png', engine=engine)
        
        # Base attributes
        g.attr(rankdir=rankdir, bgcolor=current_theme["bg"], fontcolor=current_theme["text"], 
               fontname='Arial', margin='0.2', overlap='false', splines='true', dpi=str(dpi))
        # Node styling
        if layout == "vertical":
            g.attr('node', shape='box', style='rounded,filled', fillcolor=current_theme["node"],
        color=current_theme["node"], fontcolor=current_theme["text"], fontname='Arial', 
        fontsize='14', margin='0.6,0.5', height='0.6', width='3.0', penwidth='2.0')  # Increased sizes
            
            # Increase edge thickness for vertical layout
            g.attr('edge', color=current_theme["edge"], fontcolor=current_theme["text"], 
        fontname='Arial', fontsize='12', penwidth='2.0', len='0.8')  # Thicker edges
        else:
            # Original node attributes for other layouts
            g.attr('node', shape='box', style='rounded,filled', fillcolor=current_theme["node"],
        color=current_theme["node"], fontcolor=current_theme["text"], fontname='Arial', 
        fontsize='14', margin='0.4,0.3', height='0.6', width='3.0', penwidth='1.5')
            
            g.attr('edge', color=current_theme["edge"], fontcolor=current_theme["text"], 
        fontname='Arial', fontsize='12', penwidth='1.5', len='0.05')
        # Store metadata for frontend interactivity
        metadata = {
            "all_nodes": ["center"],
            "node_relationships": [],
            "categories": []
        }
        
        # Create center node
        center_id = 'center'
        g.node(center_id, f"<<table border='0' cellpadding='5'><tr><td><b>{data['title']['text']}</b></td></tr>"
                          f"<tr><td>{data['title']['description']}</td></tr></table>>", 
               shape='box', style='rounded,filled', fillcolor=current_theme["center"], 
               color=current_theme["center"], fontcolor='white', fontsize='18', 
               width='3.5', height='1.5', penwidth='2', tooltip=data['title']['description'])
        
        categories = data['categories']
        colors = self.generate_colors(len(categories))
        
        # Create category nodes and their subcategories
        for i, category in enumerate(categories):
            category_id = self.generate_id(category['text'])
            metadata["all_nodes"].append(category_id)
            metadata["categories"].append({
                "id": category_id,
                "text": category['text'],
                "color": colors[i]
            })
            
            g.node(category_id, f"<<table border='0' cellpadding='5'><tr><td><b>{category['text']}</b></td></tr>"
                               f"<tr><td>{category['description']}</td></tr></table>>", 
                   fillcolor=colors[i], color=colors[i], fontsize='16', 
                   tooltip=category['description'])
            
            g.edge(center_id, category_id, penwidth='2.0', 
                   tooltip=f"Connection: {category['text']}")
            
            metadata["node_relationships"].append((center_id, category_id))
            
            if 'subcategories' in category and category['subcategories']:
                self.create_nodes(g, category_id, category['subcategories'], colors[i], metadata)
        
        # For force-directed layout, add invisible connections to improve distribution
        if layout == "force":
            g.attr('edge', style='invis')
            for i in range(len(metadata["all_nodes"])-1):
                g.edge(metadata["all_nodes"][i], metadata["all_nodes"][i+1], constraint='false')
            g.attr('edge', style='')  # Reset style
        
        # For radial layout, set root node
        if layout == "radial":
            g.graph_attr['root'] = center_id
        
        # Generate PNG version
        png_path = g.render(output_filename, format='png', cleanup=True)
        
        # Read and encode PNG file
        with open(png_path, 'rb') as f:
            png_encoded = base64.b64encode(f.read()).decode('utf-8')
        
        # Clean up temporary file
        os.remove(png_path)
        
        # Return the encoded image and metadata
        return {
            "png": png_encoded,
            "metadata": metadata,
            "theme": theme,
            "layout": layout
        }

def create_mind_map(data: Dict[str, Any], output_filename: str, dpi: int, theme: str, layout: str) -> Dict[str, Any]:
    
    
    # Generate mind map
    generator = MindMapGenerator()
    result = generator.generate_mind_map(
        data, output_filename=output_filename, dpi=dpi, theme=theme, layout=layout
    )
    
    # Save result to JSON file
    output_json = f"{output_filename}.json"
    with open(output_json, 'w') as f:
        json.dump(result, f)
    
    print(f"Mind map generated and saved to {output_filename}.png")
    print(f"Metadata saved to {output_json}")

    return result

if __name__ == "__main__":
    data = {
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
    create_mind_map(data, "mind_map", 300, "dark", "horizontal")