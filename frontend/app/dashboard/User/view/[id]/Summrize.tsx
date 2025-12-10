export default function SumrrizeAI({
  text,
  setMouseColor,
  closeSumrize,
}: {
  text: string;
  setMouseColor: (x: string) => void;
  closeSumrize: () => void;
}) {
  // Determine if text is empty for loading state
  const isLoading = !text;

  // Handle mouse events based on your original logic
  const handleMouseEnter = () => setMouseColor("black");
  const handleMouseLeave = () => setMouseColor("white");

  // Note: The outer div maintains the original style of width: "20%" and height: "95%"
  return (
    <div
      className="ml-2"
      style={{ width: "20%", height: "95%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Summary Content Card (The inner div) */}
      <div
        className="bg-white border rounded-xl shadow-xl h-full flex flex-col overflow-hidden" // Added flex, shadow-xl, and overflow-hidden
        style={{ background: "white" }}
      >
        {/* Small Part Content - START */}

        {/* Header Section (Title and Close Button) */}
        <div
          className="p-3 border-b border-gray-200 flex justify-between items-center bg-black text-white flex-shrink-0"
          onMouseEnter={handleMouseLeave}
          onMouseLeave={handleMouseEnter}
        >
          <h3 className="text-sm font-bold truncate">🤖 AI Summary</h3>
          {/* Close Button */}
          <button
            onClick={closeSumrize}
            className="p-1 rounded-full hover:bg-black transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-white"
            aria-label="Close summary"
          >
            {/* Simple 'X' icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Main Summary Text Area */}
        <div className="flex-1 p-3 overflow-y-auto">
          {isLoading ? (
            // Loading State
            <div className="text-center py-5 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-2"></div>
              <p className="text-xs font-medium">Summarizing...</p>
            </div>
          ) : (
            // Displayed Summary Text
            <p className="text-gray-700 text-sm leading-snug whitespace-pre-wrap">
              {text}
            </p>
          )}
        </div>

        {/* Small Part Content - END */}
      </div>
    </div>
  );
}
