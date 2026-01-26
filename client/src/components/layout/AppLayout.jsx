import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = ({ children, onNavigate, currentView }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar onNavigate={onNavigate} currentView={currentView} />
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto min-h-[calc(100vh-4rem)] bg-gray-50/30">
          <div className="max-w-6xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
