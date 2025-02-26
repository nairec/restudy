'use client';

import { useState } from 'react';
import { FileText, Upload, ClipboardType } from 'lucide-react';
import DocumentUpload from './components/DocumentUpload';
import Summary from './components/Summary';
import MindMap from './components/MindMap';
import Questions from './components/Questions';
import Resources from './components/Resources';
import LoadingOverlay from './components/LoadingOverlay';
import GridLayout from './components/GridLayout';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string[]>(['summary']);
  const [inputType, setInputType] = useState<'file' | 'text' | 'youtube'>('file');

  const handleAnalyze = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://restudyserver.onrender.com:8000/analyze-content', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191825]">
      <nav className="bg-[#191825] shadow-lg border-b border-[#00FF9C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-[#00FF9C]" />
              <h1 className="ml-2 text-xl sm:text-2xl font-bold text-[#00FF9C]">
                restudy
              </h1>
            </div>
          </div>
        </div>
      </nav>
      <main className="bg-[#191825] max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
        <div className="rounded-lg border border-[#00FF9C]/20 shadow-[0_0_20px_rgba(0,255,156,0.15)] p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap border-b border-[#00FF9C]/20">
              <button
                className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium flex-1 sm:flex-none ${
                  inputType === 'file'
                    ? 'text-[#00FF9C] border-b-2 border-[#00FF9C]'
                    : 'text-[#00FF9C]/60 hover:text-[#00FF9C] transition-colors duration-200'
                }`}
                onClick={() => setInputType('file')}
              >
                <div className="flex items-center justify-center">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Upload File
                </div>
              </button>
              <button
                className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium flex-1 sm:flex-none ${
                  inputType === 'text'
                    ? 'text-[#00FF9C] border-b-2 border-[#00FF9C]'
                    : 'text-[#00FF9C]/60 hover:text-[#00FF9C] transition-colors duration-200'
                }`}
                onClick={() => setInputType('text')}
              >
                <div className="flex items-center justify-center">
                  <ClipboardType className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Paste Text
                </div>
              </button>
            </div>
          </div>
          <DocumentUpload 
            onAnalyze={handleAnalyze} 
            selectedAnalysis={selectedAnalysis}
            setSelectedAnalysis={setSelectedAnalysis}
            inputType={inputType}
          />
        </div>
        
        {results ? (
          <GridLayout>
            <Summary text={results['summary'] || ""} />
            <Questions 
              questions={results['questions'] || []} 
              answers={results['answers'] || []} 
            />
            <MindMap imageData={results['mindmap'] || ""} />
            <Resources resources={results['resources'] || []} />
          </GridLayout>
        ) : (
          <GridLayout>
            <Summary text={""} />
            <Questions 
              questions={[]} 
              answers={[]} 
            />
            <MindMap imageData={""} />
            <Resources resources={[]} />
          </GridLayout>
        )}
        
        <LoadingOverlay isVisible={isLoading} />
      </main>
    </div>
  );
}
