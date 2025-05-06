import React, { useState } from 'react';
import Image from 'next/image';
import CreateBoardModal from './CreateBoardModal';

export default function Header(): React.ReactElement {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleBoardCreated = () => {
    // Call the global refresh function if it exists
    const customWindow = window as Window & { refreshBoards?: () => void };
    if (typeof window !== 'undefined' && customWindow.refreshBoards) {
      customWindow.refreshBoards();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 7H7v6h6V7z" />
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800">Project Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-150 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Board</span>
            </button>
            <div className="flex items-center ml-2">
              <Image
                className="h-8 w-8 rounded-full"
                src="data:image/jpeg;base64,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"
                alt="User avatar"
                width={32}
                height={32}
              />
            </div>
          </div>
        </div>
      </div>

      <CreateBoardModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />
    </header>
  );
} 