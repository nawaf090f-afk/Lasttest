import React from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { RecordingIndicator } from './components/RecordingIndicator';

function App() {
  return (
    <div className="min-h-screen bg-yellow-400 relative overflow-hidden flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Background Pattern for aesthetics */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-200 rounded-full blur-3xl"></div>
      </div>

      {/* Header / Recording Indicator Area */}
      <div className="absolute top-6 left-6 z-10">
        <RecordingIndicator />
      </div>

      {/* Main Content */}
      <div className="w-full flex justify-center z-10">
        <RegistrationForm />
      </div>
      
      <footer className="absolute bottom-4 text-yellow-800/60 text-sm font-medium">
        &copy; 2025 جميع الحقوق محفوظة
      </footer>
    </div>
  );
}

export default App;
