'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Board, fetchBoards } from '@/data/boards';

export default function BoardList(): React.ReactElement {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadBoards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const boardsData = await fetchBoards();
      setBoards(boardsData);
    } catch (err) {
      setError('Failed to load boards. Please refresh the page.');
      console.error('Error loading boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleBoardClick = (boardId: number) => {
    router.push(`/board/${boardId}`);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Your Boards</h2>
      </div>
      
      {isLoading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">{error}</div>
      ) : boards.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No boards found. Create your first board to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {boards.map((board) => (
            <li key={board.id} className="hover:bg-gray-50 cursor-pointer">
              <div 
                onClick={() => handleBoardClick(board.id)}
                className="block p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">{board.name}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(board.created_at).toLocaleDateString()}
                  </span>
                </div>
                {board.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {board.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 