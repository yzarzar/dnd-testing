"use client";

import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import BoardList from "@/components/BoardList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleBoardCreated = useCallback(() => {
    // Increment the key to trigger re-render of the BoardList component
    setRefreshKey(prev => prev + 1);
  }, []);

  // Pass the handleBoardCreated to Header via context or props
  // For simplicity, we're using a global window function here
  if (typeof window !== 'undefined') {
    (window as any).refreshBoards = handleBoardCreated;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Project Hub</h1>
          <p className="text-gray-600 mb-8">Select a board below to view and manage your tasks, or create a new board to get started.</p>
          <BoardList key={refreshKey} />
        </div>
      </main>
    </div>
  );
}
