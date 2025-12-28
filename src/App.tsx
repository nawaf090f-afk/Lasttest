import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';

// شلنا نظام الحماية مؤقتاً عشان الموقع يفتح معاك طوالي وتشوف صفحة الطلبات
function App() {
  return (
    <Router basename="/Lasttest">
      <Routes>
        {/* خليت ليك صفحة الداشبورد هي الصفحة الأساسية */}
        <Route path="/" element={<Dashboard />} />
        {/* لو في أي مسار غلط، برضه يوديك للداشبورد */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
