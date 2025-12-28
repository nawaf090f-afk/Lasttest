import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Phone, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', formData.phone)
        .eq('password', formData.password)
        .single();

      if (error || !data) {
        throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة');
      }

      // Login with role
      login({ 
        name: data.full_name, 
        phone: data.phone,
        role: data.role || 'client' // Fallback for old users
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-500">مرحباً بك مجدداً</p>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Phone className="absolute top-3.5 right-3 text-gray-400" size={20} />
            <input
              type="tel"
              required
              dir="ltr"
              placeholder="رقم الهاتف"
              className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none text-right"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3.5 right-3 text-gray-400" size={20} />
            <input
              type="password"
              required
              placeholder="كلمة المرور"
              className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="text-left">
            <Link to="/forgot-password" className="text-sm text-yellow-600 hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التحقق...' : (
              <>
                دخول
                <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <Link to="/signup" className="text-yellow-600 font-bold hover:underline">
            سجل عضو جديد
          </Link>
        </div>
      </div>
    </div>
  );
};
