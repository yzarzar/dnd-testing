import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-red-500 text-xl">{message}</div>
    </div>
  );
};
