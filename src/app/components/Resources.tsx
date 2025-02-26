export default function Resources({ resources }: { resources: string[] }) {
  return (
    <div className="bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-4 shadow-[0_0_15px_rgba(0,255,156,0.1)]">
      {resources.length > 0 ? (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-indigo-800">Additional Resources</h2>
        <ul className="list-disc pl-5 text-[#00FF9C] hover:text-[#00FF9C]/80 underline transition-colors duration-200">
          {resources.map((resource, index) => (
            <li key={index} className="mb-2">{resource}</li>
          ))}
        </ul>
      </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-lg font-medium">Additional Resources</p>
          <p className="text-center text-sm text-gray-500">Upload a document to discover related learning materials</p>
        </div>
      )}
    </div>
  );
}