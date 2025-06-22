import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-secondary/5">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>
      <footer className="py-4 bg-white/50 backdrop-blur-sm border-t border-gray-100">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          Created by Nicolas DAVID & Alexandre LANG (TEC FR)
        </div>
      </footer>
    </div>
  );
}