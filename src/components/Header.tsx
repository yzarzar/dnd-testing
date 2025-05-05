import React, { useState } from 'react';
import CreateBoardModal from './CreateBoardModal';

export default function Header(): React.ReactElement {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleBoardCreated = () => {
    // Call the global refresh function if it exists
    if (typeof window !== 'undefined' && (window as any).refreshBoards) {
      (window as any).refreshBoards();
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
              <img
                className="h-8 w-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
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