'use client';

import { useState } from 'react';
import Image from "next/image";
import { FileText, Upload, ClipboardType } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import Summary from '../components/Summary';
import MindMap from '../components/MindMap';
import Questions from '../components/Questions';
import Resources from '../components/Resources';
import LoadingOverlay from '../components/LoadingOverlay';


export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string[]>(['summary']);
  const [inputType, setInputType] = useState<'file' | 'text'>('file');

  const handleAnalyze = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://restudy.onrender.com/analyze-content', {
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-2 text-2xl font-bold text-indigo-600">
              restudy
            </h1>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  inputType === 'file'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setInputType('file')}
              >
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </div>
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  inputType === 'text'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setInputType('text')}
              >
                <div className="flex items-center">
                  <ClipboardType className="h-4 w-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {selectedAnalysis.includes('summary') && (
              <Summary text={results['summary'] || ""} />
            )}
            {selectedAnalysis.includes('mindmap') && (
              <MindMap imageData={results['mindmap'] || ""} />
            )}
            {selectedAnalysis.includes('questions') && (
              <Questions 
                questions={results['questions'] || []} 
                answers={results['answers'] || []} 
              />
            )}
            {selectedAnalysis.includes('resources') && (
              <Resources resources={results['resources'] || []} />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Summary text={""} />
            <MindMap imageData={""} />
            <Questions 
              questions={[]} 
              answers={[]} 
            />
            <Resources resources={[]} />
          </div>
        )}
        
        <LoadingOverlay isVisible={isLoading} />
      </main>
    </div>
  );
}

