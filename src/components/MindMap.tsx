import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type ConceptMapViewerProps = {
  imageData: string; // Prop para recibir la imagen codificada en base64
};

const MindMap: React.FC<ConceptMapViewerProps> = ({ imageData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {imageData?(
        <div style={{ width: "100%", height: "100%" }}>
          <h2 className="text-xl font-bold mb-4 text-indigo-800">Mind Map</h2>
        <TransformWrapper>
          {(
            <div className="relative">
              <TransformComponent>
                <img
                  src={'data:image/png;base64,'+ imageData}
                  alt="Mapa Conceptual"
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
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
          <p className="text-sm">Upload a document to generate a mind map</p>
        </div>
      )}
      
    </div>
  );
};

export default MindMap;

