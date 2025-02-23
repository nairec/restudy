import { useState } from 'react';
import { Upload, ClipboardType } from 'lucide-react';

interface DocumentUploadProps {
  onAnalyze: (formData: FormData) => Promise<void>;
  selectedAnalysis: string[];
  setSelectedAnalysis: (analysis: string[]) => void;
  inputType: 'file' | 'text';
}

export default function DocumentUpload({ onAnalyze, selectedAnalysis, setSelectedAnalysis, inputType }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLength, setSummaryLength] = useState(200);
  const [questionNumber, setQuestionNumber] = useState(3);
  const [difficulty, setDifficulty] = useState('moderate');
  const [text, setText] = useState('');

  const analysisOptions = [
    { value: 'summary', label: 'Summary' },
    { value: 'mindmap', label: 'Mind Map' },
    { value: 'questions', label: 'Questions' },
    { value: 'resources', label: 'Resources (Not implemented yet)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && inputType === 'file') return;

    const formData = new FormData();
    if (file && inputType === 'file') formData.append('document', file);
    formData.append('text', text);
    formData.append('summary_length', summaryLength.toString());
    formData.append('question_number', questionNumber.toString());
    formData.append('question_difficulty', difficulty.toString());
    formData.append('analysis_type', selectedAnalysis.toString());

    await onAnalyze(formData);
  };

  const handleAnalysisChange = (type: string) => {
    setSelectedAnalysis(
      selectedAnalysis.includes(type)
        ? selectedAnalysis.filter(t => t !== type)
        : [...selectedAnalysis, type]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div>
        {inputType === 'file' ? (
          <h2 className="text-black font-semibold mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Your Document
          </h2>
        ):(
          <h2 className="text-black font-semibold mb-4 flex items-center">
            <ClipboardType className="h-5 w-5 mr-2" />
            Paste your text
          </h2>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {inputType === 'file' ? (
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-black">
              Choose a document (PDF, DOCX, or TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="p-2 border border-gray-300 rounded-md text-white"
            />
            {file && (
              <p className="text-sm text-black">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
          </div>
        ):(
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-black">
              Paste your text here
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value as string)}
              className="p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
        )}
        
        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-black block">
              Summary Length (50-500 words)
            </label>
            <input
              type="number"
              min="50"
              max="500"
              value={summaryLength}
              onChange={(e) => setSummaryLength(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md text-black mt-1"
            />
            <div className="mt-1">
              {(summaryLength >= 50 && summaryLength <= 500) && (
                <p className="text-sm text-black">
                  Summary will be aproximately {summaryLength} words long
                </p>
              )}
              {(summaryLength < 50 || summaryLength > 500) && (
                <p className="text-sm text-red-500">
                  Please enter a value between 50 and 500
                </p>
              )}
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-black block">
              Number of Questions (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md text-black mt-1"
            />
            <div className="mt-1">
              {(questionNumber >= 1 && questionNumber <= 10) && (
                <p className="text-sm text-black">
                  {questionNumber} questions will be generated
                </p>
              )}
              {(questionNumber < 1 || questionNumber > 10) && (
                <p className="text-sm text-red-500">
                  Please enter a value between 1 and 10
                </p>
              )}
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-black block">
              Question Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as string)}
              className="w-full p-2 border border-gray-300 rounded-md text-black mt-1 bg-white"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="difficult">Difficult</option>
              <option value="further research required">Further Research Required</option>
              <option value="varied">Varied</option>
            </select>
            <p className="text-sm text-black mt-1">
              Selected difficulty: {difficulty}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Select Analysis Types:</p>
          <div className="space-y-2">
            {analysisOptions.map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedAnalysis.includes(value)}
                  onChange={() => handleAnalysisChange(value)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!file && inputType === 'file' || 
                   summaryLength < 50 || 
                   summaryLength > 500 || 
                   questionNumber < 1 || 
                   questionNumber > 10 ||
                   text.length <= 0 && inputType === 'text'}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md 
                   hover:bg-indigo-700 transition duration-300 ease-in-out
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Analyze Document
        </button>
      </form>
    </div>
  );
}