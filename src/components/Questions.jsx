import React, { useState } from 'react';

const Questions = ({ questions, answers }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleQuestionClick = (index) => {
    setSelectedQuestion(selectedQuestion === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Practice Questions</h2>
      <div className="space-y-4">
        {questions.map((question, index) => (
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
    </div>
  );
};

export default Questions;
