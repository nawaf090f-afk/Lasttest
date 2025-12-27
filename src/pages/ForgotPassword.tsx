import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Phone, HelpCircle, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { securityQuestions } from '../data/securityQuestions';
import { supabase } from '../lib/supabase';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Verify, 2: Reset Password
  const [formData, setFormData] = useState({
    phone: '',
    securityQuestion: '',
    securityAnswer: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', formData.phone)
        .eq('security_question', formData.securityQuestion)
        .eq('security_answer', formData.securityAnswer)
        .single();

      if (error || !data) {
        throw new Error('البيانات غير صحيحة. تأكد من رقم الهاتف وإجابة السؤال.');
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ password: formData.newPassword })
        .eq('phone', formData.phone);

      if (error) throw error;

      navigate('/login', { state: { message: 'تم تغيير كلمة المرور بنجاح' } });
    } catch (err: any) {
      setError('حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/login" className="text-gray-400 hover:text-gray-600">
            <ArrowRight size={24} />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">استعادة كلمة المرور</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-gray-500 text-sm mb-4">أدخل رقم الهاتف وأجب على سؤال الأمان للتحقق من هويتك.</p>
            
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
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
              {loading ? 'جاري التحقق...' : 'تحقق'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
             <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle size={16} />
                تم التحقق بنجاح. أدخل كلمة المرور الجديدة.
             </div>

            <div className="relative">
              <KeyRound className="absolute top-3.5 right-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                placeholder="كلمة المرور الجديدة"
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                value={formData.newPassword}
                onChange={e => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
              {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
