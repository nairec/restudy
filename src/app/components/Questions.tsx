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
    <div className="bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-4 shadow-[0_0_15px_rgba(0,255,156,0.1)]">
      {questions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4 text-[#00FF9C]">Practice Questions</h2>
          {questions.map((question: string, index: number) => (
            <div key={index} className="border border-[#00FF9C]/20 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,255,156,0.2)]">
              <div 
                onClick={() => handleQuestionClick(index)}
                className={`p-4 cursor-pointer transition-all duration-300 
                  ${selectedQuestion === index 
                    ? 'bg-[#232031] border-l-4 border-[#00FF9C]' 
                    : 'hover:bg-[#1E1B2E] hover:border-l-4 hover:border-[#00FF9C]/50'
                  }`}
              >
                <div className="flex items-start">
                  <span className="font-semibold text-[#00FF9C] mr-3">
                    {index + 1}.
                  </span>
                  <span className="text-white/90">{question}</span>
                </div>
              </div>
              
              {selectedQuestion === index && (
                <div className="p-4 bg-[#1A1927] border-t border-[#00FF9C]/20">
                  <div className="flex">
                    <span className="font-semibold text-[#00FF9C] mr-3">Answer:</span>
                    <span className="text-white/80">{answers[index]}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
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