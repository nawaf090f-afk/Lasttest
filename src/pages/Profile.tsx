import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Lock, Shield, LogOut, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { securityQuestions } from '../data/securityQuestions';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [securityQ, setSecurityQ] = useState({ question: '', answer: '' });

  // Load initial security question (optional, but good for UX if we want to show current)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.phone) return;
      const { data } = await supabase
        .from('members')
        .select('security_question')
        .eq('phone', user.phone)
        .single();
      
      if (data) {
        setSecurityQ(prev => ({ ...prev, question: data.security_question }));
      }
    };
    fetchUserData();
  }, [user?.phone]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ full_name: name })
        .eq('phone', user?.phone);

      if (error) throw error;
      updateUser({ name });
      showMessage('success', 'تم تحديث الاسم بنجاح');
    } catch (err) {
      showMessage('error', 'فشل تحديث الاسم');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ password: password })
        .eq('phone', user?.phone);

      if (error) throw error;
      setPassword('');
      showMessage('success', 'تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      showMessage('error', 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          security_question: securityQ.question,
          security_answer: securityQ.answer
        })
        .eq('phone', user?.phone);

      if (error) throw error;
      setSecurityQ(prev => ({ ...prev, answer: '' }));
      showMessage('success', 'تم تحديث سؤال الأمان بنجاح');
    } catch (err) {
      showMessage('error', 'فشل تحديث سؤال الأمان');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10" dir="rtl">
      {/* Header */}
      <div className="bg-yellow-400 p-6 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-yellow-900 hover:bg-white/20 p-2 rounded-full transition-colors">
            <ArrowRight size={24} />
          </button>
          <h1 className="text-2xl font-bold text-yellow-900">الملف الشخصي</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 -mt-4">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-yellow-600">
            <User size={20} />
            <h2 className="font-bold text-lg">المعلومات الأساسية</h2>
          </div>
          
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">رقم الهاتف</label>
              <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500 dir-ltr text-right font-mono">
                {user?.phone}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">اسم المستخدم</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={loading || name === user?.name}
                  className="bg-yellow-500 text-white p-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-yellow-600">
            <Lock size={20} />
            <h2 className="font-bold text-lg">كلمة المرور</h2>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="flex gap-2">
            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <button 
              type="submit" 
              disabled={loading || !password}
              className="bg-yellow-500 text-white p-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
            </button>
          </form>
        </div>

        {/* Security Question Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-yellow-600">
            <Shield size={20} />
            <h2 className="font-bold text-lg">سؤال الأمان</h2>
          </div>
          
          <form onSubmit={handleUpdateSecurity} className="space-y-4">
            <select
              value={securityQ.question}
              onChange={(e) => setSecurityQ({ ...securityQ, question: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none appearance-none"
            >
              <option value="" disabled>اختر سؤال الأمان</option>
              {securityQuestions.map((q, idx) => (
                <option key={idx} value={q}>{q}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="إجابة السؤال الجديدة"
                value={securityQ.answer}
                onChange={(e) => setSecurityQ({ ...securityQ, answer: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              <button 
                type="submit" 
                disabled={loading || !securityQ.answer || !securityQ.question}
                className="bg-yellow-500 text-white p-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                <Save size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mt-8"
        >
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};
