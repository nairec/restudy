export default function Summary({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {text ? (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-indigo-800">Summary</h2>
        <p className="text-gray-700">{text}</p>
      </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">Document Summary</p>
          <p className="text-center text-sm">Upload a document to generate a smart summary</p>
        </div>
      )}
    </div>
  );
}



