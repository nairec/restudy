import { useState } from 'react';
import { Upload, ClipboardType, Info, X } from 'lucide-react';

interface DocumentUploadProps {
  onAnalyze: (formData: FormData) => Promise<void>;
  selectedAnalysis: string[];
  setSelectedAnalysis: (analysis: string[]) => void;
  inputType: 'file' | 'text' | 'youtube';
}

interface MessageBoxProps {
  message: string;
  onClose: () => void;
}

const MessageBox = ({ message, onClose }: MessageBoxProps) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">About</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-gray-600 whitespace-pre-line">{message}</p>
    </div>
  </div>
);

export default function DocumentUpload({ onAnalyze, selectedAnalysis, setSelectedAnalysis, inputType }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLength, setSummaryLength] = useState(200);
  const [questionNumber, setQuestionNumber] = useState(3);
  const [difficulty, setDifficulty] = useState('moderate');
  const [text, setText] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  const analysisOptions = [
    { value: 'summary', label: 'Summary' },
    { value: 'mindmap', label: 'Mind Map' },
    { value: 'questions', label: 'Questions' },
    { value: 'resources', label: 'Resources' },
  ];

  const showInfoMessage = (message: string) => {
    setCurrentMessage(message);
    setShowMessage(true);
  };
  
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
    <div className="bg-[#191825] rounded-lg shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {inputType === 'file' ? (
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-white">
                      Choose a document (PDF, DOCX, or TXT)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full bg-[#191825] border-2 border-dashed border-[#00FF9C]/20 text-[#00FF9C] rounded-lg p-8 cursor-pointer hover:bg-[#00FF9C]/5 transition-all duration-200"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">Drop your file here or click to browse</span>
                        </div>
                      </label>
                      {file && (
                        <p className="text-sm text-[#00FF9C] mt-2 flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-white">
                      Paste your text here
                    </label>
                    <div className="relative">
                      <textarea
                        rows={5}
                        value={text}
                        onChange={(e) => setText(e.target.value as string)}
                        placeholder="Type or paste your text here..."
                        className="w-full p-4 border border-[#00FF9C]/20 rounded-lg text-white bg-[#191825] placeholder-[#00FF9C]/40 focus:outline-none focus:ring-2 focus:ring-[#00FF9C]/50"
                      />
                      <ClipboardType className="absolute top-4 right-4 h-5 w-5 text-[#00FF9C]/40" />
                    </div>
                  </div>
                )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white block">
                Summary Length (50-500 words)
              </label>
              <button 
                type="button"
                className="md:hidden text-white"
                onClick={() => showInfoMessage(`Aproximate length of the summary (if 'Summary' is selected)`)}
              >
                <Info className="h-4 w-4 text-white-500" />
              </button>
            </div>
            <input
              type="number"
              min="50"
              max="500"
              value={summaryLength}
              onChange={(e) => setSummaryLength(Number(e.target.value))}
              className="w-full p-2 border rounded-md mt-1 bg-[#191825] text-[#00FF9C] border-[#00FF9C]"
            />
            <div className="mt-1 hidden md:block">
              {(summaryLength >= 50 && summaryLength <= 500) && (
                <p className="text-sm text-white">
                  The summary will be approximately {summaryLength} words long.
                </p>
              )}
            </div>
            {(summaryLength < 50 || summaryLength > 500) && (
                <p className="text-sm text-red-500">
                  Please enter a value between 50 and 500
                </p>
              )}
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white block bg-[#191825]">
                Number of Questions (1-10)
              </label>
              <button 
                type="button"
                className="md:hidden text-white"
                onClick={() => showInfoMessage(`Number of questions that will be generated (if 'Questions' is selected)`)}
              >
                <Info className="h-4 w-4 text-white-500" />
              </button>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(Number(e.target.value))}
              className="w-full p-2 border rounded-md mt-1 bg-[#191825] text-[#00FF9C] border-[#00FF9C]"
            />
            <div className="mt-1 hidden md:block">
              {(questionNumber >= 1 && questionNumber <= 10) && (
                <p className="text-sm text-white">
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

          <div className="w-full">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white block">
                Question Difficulty
              </label>
              <button 
                type="button"
                className="md:hidden text-white"
                onClick={() => showInfoMessage(`Difficulty level of the generated questions (if 'Questions' is selected) \n 'Further Research Required' means you will need to do further research to answer the questions`)}
              >
                <Info className="h-4 w-4 text-white-500" />
              </button>
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as string)}
              className="w-full p-2 border rounded-md bg-[#191825] border-[#00FF9C] text-[#00FF9C] hover:bg-[#00FF9C]/10"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="difficult">Difficult</option>
              <option value="further research required">Further Research Required</option>
              <option value="varied">Varied</option>
            </select>
            <p className="text-sm text-white mt-1 hidden md:block">
              Selected difficulty: {difficulty}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-white mb-2">Select Analysis Types:</p>
          <div className="space-y-2">
            {analysisOptions.map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedAnalysis.includes(value)}
                  onChange={() => handleAnalysisChange(value)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-white">{label}</span>
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
                   disabled:bg-gray-400 disabled:cursor-not-allowed bg-[#191825] border border-[#00FF9C] text-[#00FF9C] hover:bg-[#00FF9C]/10 transition-all duration-200 rounded-lg px-6 py-2 shadow-[0_0_10px_rgba(0,255,156,0.2)]"
        >
          Analyze Document
        </button>
      </form>
      {showMessage && (
        <MessageBox 
          message={currentMessage} 
          onClose={() => setShowMessage(false)} 
        />
      )}
    </div>
  );
}