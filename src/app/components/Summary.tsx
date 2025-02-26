import React from 'react';

export default function Summary({ text }: {text: string}){
  return (
    <div className="bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-6 shadow-[0_0_15px_rgba(0,255,156,0.1)]">
      {text ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#00FF9C] mb-4">Summary</h2>
          <div className="bg-[#1A1927] border border-[#00FF9C]/20 rounded-lg p-5">
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">Summary</p>
          <p className="text-center text-sm">Upload a document to generate a summary</p>
        </div>
      )}
    </div>
  );
};
