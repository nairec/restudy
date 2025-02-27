import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Image from "next/image"

type ConceptMapViewerProps = {
  imageData: string; // Prop para recibir la imagen codificada en base64
};

const MindMap: React.FC<ConceptMapViewerProps> = ({ imageData }) => {
 
  const handleDownload = () => {
    const link = document.createElement('a') as unknown as HTMLAnchorElement;
    link.href = 'data:image/png;base64,' + imageData;
    link.download = 'mindmap.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  return (
    <div className="bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,156,0.1)]">
      {imageData?(
        <div style={{ width: "100%", height: "100%" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#00FF9C]">Mind Map</h2>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#00FF9C]/10 hover:bg-[#00FF9C]/20 
                       text-[#00FF9C] rounded-lg transition-all duration-300 border border-[#00FF9C]/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download
            </button>
          </div>
          <TransformWrapper>
            {(
              <div className="relative border border-[#00FF9C]/30 rounded-lg overflow-hidden">
                <TransformComponent>
                  <Image
                    src={'data:image/png;base64,'+ encodeURIComponent(imageData)}
                    alt="Mapa Conceptual"
                    height={600}
                    width={800}
                  />
                </TransformComponent>
              </div>
            )}
          </TransformWrapper>
      </div>
      ):(
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium ">Mind Map</p>
          <p className="text-center text-sm">Upload a document to generate a mind map</p>
        </div>
      )}
      
    </div>
  );
};

export default MindMap;

