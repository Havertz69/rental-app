import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center bg-white rounded-2xl p-8 border border-slate-100">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-slate-500 mt-2">Page not found</p>
        <p className="mt-4 text-sm text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg">Go home</Link>
      </div>
    </div>
  );
}
