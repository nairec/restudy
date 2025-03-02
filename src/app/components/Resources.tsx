export default function Resources({ resources }: { resources: string[] }) {
  return (
    <div className="bg-[#191825] border border-[#00FF9C]/20 rounded-lg p-4 shadow-[0_0_15px_rgba(0,255,156,0.1)]">
      {resources.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#00FF9C] tracking-wide">
            Additional Resources
          </h2>
          <ul className="space-y-3">
            {resources.map((resource, index) => (
              <li key={index} className="group">
                <div className="flex flex-col space-y-1">
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start md:items-center space-x-2 p-3 rounded-md bg-[#2A2B3D] hover:bg-[#2A2B3D]/80 border border-[#00FF9C]/10 transition-all duration-300 hover:border-[#00FF9C]/30"
                  >
                    <div className="flex-shrink-0 mt-1 md:mt-0">
                      {resource.includes("https") ? (
                        <svg
                          className="w-5 h-5 text-[#00FF9C] group-hover:scale-110 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-white hover:text-[#00FF9C] text-sm break-all">
                      {resource}
                    </span>
                  </a>
                  {resource.startsWith('http://') && (
                    <div className="opacity-100 ml-3 text-xs text-yellow-500 md:h-0 md:opacity-0 group-hover:opacity-100 group-hover:h-4 transition duration-300 flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>This link uses an unsecured HTTP connection</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-lg font-medium mb-2 text-center px-4">Additional Resources</p>
          <p className="text-center text-sm text-gray-500 px-4">
            Upload a document to discover related learning materials
          </p>
        </div>
      )}
    </div>
  );
}