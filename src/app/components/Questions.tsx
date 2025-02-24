import React, { useState } from 'react';

interface QuestionsProps {
  questions: string[];
  answers: string[];
}

const Questions: React.FC<QuestionsProps> = ({ questions, answers }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const handleQuestionClick = (index: number) => {
    setSelectedQuestion(selectedQuestion === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {questions.length > 0 ? (
        <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4 text-indigo-800">Practice Questions</h2>
        {questions.map((question: string, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              onClick={() => handleQuestionClick(index)}
              className={`p-4 cursor-pointer transition-colors duration-200 
                ${selectedQuestion === index 
                  ? 'bg-blue-50' 
                  : 'bg-white hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start">
                <span className="font-semibold text-blue-600 mr-2">
                  {index + 1}.
                </span>
                <span className="text-gray-700">{question}</span>
              </div>
            </div>
            
            {selectedQuestion === index && (
              <div className="p-4 bg-blue-50 border-t border-blue-100">
                <div className="flex">
                  <span className="font-semibold text-blue-600 mr-2">Answer:</span>
                  <span className="text-gray-700">{answers[index]}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      ):(
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">Practice Questions</p>
          <p className="text-center text-sm text-grey-500">Upload a document to generate practice questions</p>
        </div>
      )}
      
    </div>
  );
};

export default Questions;
