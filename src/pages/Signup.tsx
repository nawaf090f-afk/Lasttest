import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Phone, Lock, User, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { securityQuestions } from '../data/securityQuestions';
import { supabase } from '../lib/supabase';

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if phone already exists
      const { data: existingUser } = await supabase
        .from('members')
        .select('phone')
        .eq('phone', formData.phone)
        .single();

      if (existingUser) {
        throw new Error('رقم الهاتف مسجل مسبقاً');
      }

      // Create new member
      const { error: insertError } = await supabase
        .from('members')
        .insert([
          {
            full_name: formData.name,
            phone: formData.phone,
            password: formData.password, // Note: In production, hash this password!
            security_question: formData.securityQuestion,
            security_answer: formData.securityAnswer
          }
        ]);

      if (insertError) throw insertError;

      navigate('/login', { state: { message: 'تم إنشاء الحساب بنجاح! قم بتسجيل الدخول الآن.' } });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">عضو جديد</h2>
          <p className="text-gray-500">أنشئ حسابك للوصول إلى الخدمات</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-3.5 right-3 text-gray-400" size={20} />
            <input
              type="text"
              required
              placeholder="اسم العضو"
              className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

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

          <div className="relative">
            <HelpCircle className="absolute top-3.5 right-3 text-gray-400" size={20} />
            <select
              required
              className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none appearance-none cursor-pointer"
              value={formData.securityQuestion}
              onChange={e => setFormData({...formData, securityQuestion: e.target.value})}
            >
              <option value="" disabled>اختر سؤال الأمان</option>
              {securityQuestions.map((q, idx) => (
                <option key={idx} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              required
              placeholder="إجابة سؤال الأمان"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.securityAnswer}
              onChange={e => setFormData({...formData, securityAnswer: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التسجيل...' : (
              <>
                تسجيل
                <UserPlus size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-yellow-600 font-bold hover:underline">
            سجل دخولك
          </Link>
        </div>
      </div>
    </div>
  );
};
