'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import Header from '@/components/Header';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id;
  
  console.log('BoardPage rendering with boardId:', boardId);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <KanbanBoard />
      </main>
    </div>
  );
} 