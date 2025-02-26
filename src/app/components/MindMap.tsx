import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Image from "next/image"

type ConceptMapViewerProps = {
  imageData: string; // Prop para recibir la imagen codificada en base64
};

const MindMap: React.FC<ConceptMapViewerProps> = ({ imageData }) => {
  return (
    <div className="bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,156,0.1)]">
      {imageData?(
        <div style={{ width: "100%", height: "100%" }}>
          <h2 className="text-xl font-bold mb-4 text-indigo-800">Mind Map</h2>
        <TransformWrapper>
          {(
            <div className="relative border border-[#00FF9C]/30 rounded-lg overflow-hidden">
              <TransformComponent>
                <Image
                  src={'data:image/png;base64,'+ imageData}
                  alt="Mapa Conceptual"
                  width={500}
                  height={500}
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
          <p className="text-lg font-medium">Mind Map</p>
          <p className="text-center text-sm">Upload a document to generate a mind map</p>
        </div>
      )}
      
    </div>
  );
};

export default MindMap;

