import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BedMap from './pages/BedMap';
import './index.css';

// Add Font imports dynamically
const fonts = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap', // Added Poppins for Dashboard
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // FontAwesome
];

fonts.forEach(href => {
  const link = document.createElement('link');
  link.href = href;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});

// Add Dashicons separately
const dashicons = document.createElement('link');
dashicons.href = 'https://cdnjs.cloudflare.com/ajax/libs/dashicons/4.6.3/css/dashicons.min.css';
dashicons.rel = 'stylesheet';
document.head.appendChild(dashicons);

const root = createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter>
    <div className="flex min-h-screen bg-[#f1f5f9] font-['Montserrat'] text-[#37474f]">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-0 overflow-y-auto h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beds" element={<BedMap />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);