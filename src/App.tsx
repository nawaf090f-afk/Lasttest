import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    // الـ HashRouter هو الحل الوحيد المضمون لـ GitHub Pages
    <Router>
      <Routes>
        {/* بنخلي صفحة اللوجن هي الواجهة الأساسية زي الرابط الأرسلته */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* لو أي زول كتب رابط غلط يرجعه للوجن */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
