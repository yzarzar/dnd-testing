"use client";

import React from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

// Import KanbanBoard dynamically with SSR disabled
const KanbanBoard = dynamic(
  () => import("@/components/KanbanBoard"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <KanbanBoard />
      </main>
    </div>
  );
}
