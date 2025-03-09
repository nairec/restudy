import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState, useEffect } from "react";

type NodeState = {
  hidden: boolean;
  highlighted: boolean;
};

declare global {
  interface Window {
    handleNodeClick: (nodeId: string) => void;
    handleNodeHover: (nodeId: string) => void;
    handleNodeEndHover: (nodeId: string) => void;
  }
}

type ConceptMapViewerProps = {
  imageData: string;
  metadata?: {
    all_nodes: string[];
    node_relationships: [string, string][];
    categories: { id: string; text: string; color: string }[];
    node_colors: Record<string, string>;
    theme?: string;
    layout?: string;
  };
};

const MindMap: React.FC<ConceptMapViewerProps> = ({ imageData, metadata }) => {

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const handleSvgInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    const nodeElement = target.closest('.node');
    
    if (!nodeElement) {
      setHoveredNodeId(null);
      return;
    }
    
    const nodeId = nodeElement.id;
    
    if (event.type === 'mouseover') {
      setHoveredNodeId(nodeId);
    } else if (event.type === 'click') {
      setNodeStates(prev => ({
        ...prev,
        [nodeId]: {
          hidden: !prev[nodeId]?.hidden,
          highlighted: nodeId === hoveredNodeId
        }
      }));
    }
  };

  const processInteractiveSVG = (svgData: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
    
    svgDoc.querySelectorAll('.node').forEach(node => {
      const nodeId = node.id;
      const nodeShapes = node.querySelectorAll('ellipse, polygon, path');
      const nodeColor = Array.from(nodeShapes).find(shape => shape.getAttribute('fill'))?.getAttribute('fill');
      const isInSelectedCategory = selectedCategories.size === 0 || (nodeColor && selectedCategories.has(nodeColor));
      
      node.setAttribute('style', `
        cursor: pointer;
        opacity: ${nodeStates[nodeId]?.hidden ? '0.3' : 
                  selectedCategories.size > 0 ? (isInSelectedCategory ? '1' : '0.3') : '1'};
        filter: ${nodeId === hoveredNodeId ?  'drop-shadow(0 0 12px #00FF9C)' : 'none'};
        transition: all 0.3s ease;
      `);
    });
  
    return svgDoc.documentElement.outerHTML;
  };

  const handleDownload = () => {
    const blob = new Blob([imageData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a') as unknown as HTMLAnchorElement;
    link.href = url;
    link.download = 'mindmap.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const renderCategoryBadges = () => {
    if (!metadata?.categories) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {metadata.categories.map((category) => (
          <div
            key={category.id}
            onClick={() => {
              const newSelected = new Set(selectedCategories);
              if (newSelected.has(category.color)) {
                newSelected.delete(category.color);
              } else {
                newSelected.add(category.color);
              }
              setSelectedCategories(newSelected);
            }}
            className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: category.color + "33",
              color: category.color,
              border: `1px solid ${category.color}50`,
              outline: selectedCategories.has(category.color) ? `2px solid ${category.color}` : 'none'
            }}
          >
            {category.text}
          </div>
        ))}
      </div>
    );
  }; 

  return (
    <div className={`bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,156,0.1)] transition-colors duration-300`}>
      {imageData ? (
        <div style={{ width: "100%", height: "100%" }} className="justify-center">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-[#00FF9C]">Mind Map</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-[#00FF9C]/10 hover:bg-[#00FF9C]/20 text-[#00FF9C] rounded-lg transition-all duration-300 border border-[#00FF9C]/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
          <div className="flex relative rounded-lg justify-center overflow-hidden">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              panning={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute top-4 left-50 flex gap-2 z-10">
                    <button
                      onClick={() => zoomIn()}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#00FF9C]/20 hover:bg-[#00FF9C]/30 text-[#00FF9C] transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#00FF9C]/20 hover:bg-[#00FF9C]/30 text-[#00FF9C] transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#00FF9C]/20 hover:bg-[#00FF9C]/30 text-[#00FF9C] transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                  <TransformComponent>
                    <div className={`flex justify-center border border-[#00FF9C]/30 rounded-lg overflow-hidden transition-colors duration-300`}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: processInteractiveSVG(imageData) }}
                      onMouseOver={handleSvgInteraction}
                      onClick={handleSvgInteraction}
                      style={{ 
                        width: '80%',
                        maxWidth: '80%',
                        height: 'auto',
                        minHeight: '300px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      className="justify-center sm:min-h-[400px] md:min-h-[400px] lg:min-h-[600px]"
                    />
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
          {renderCategoryBadges()}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">Mind Map</p>
          <p className="text-center text-sm">Upload a document to generate a mind map</p>
        </div>
      )}
    </div>
  );
};

export default MindMap;