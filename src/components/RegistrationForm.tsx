import React, { useState } from 'react';
import { sudanStates } from '../data/states';
import { Send, User, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          { 
            name: formData.name, 
            state: formData.state, 
            phone: formData.phone,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setStatus({ type: 'success', message: 'تم استلام البيانات بنجاح!' });
      setFormData({ name: '', state: '', phone: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ type: 'error', message: 'حدث خطأ أثناء الإرسال. الرجاء المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-yellow-100/50 relative overflow-hidden">
      {/* Status Message Overlay */}
      {status.type && (
        <div className={`absolute top-0 left-0 right-0 p-4 text-center text-sm font-medium transition-all transform ${
          status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{status.message}</span>
          </div>
        </div>
      )}

      <div className="text-center mb-8 mt-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">نموذج التسجيل</h2>
        <p className="text-gray-500 text-sm">يرجى ملء البيانات التالية بدقة</p>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-600 transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            required
            placeholder="الاسم الكامل"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-800"
          />
        </div>

        {/* State Dropdown */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-600 transition-colors">
            <MapPin size={20} />
          </div>
          <select
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all appearance-none text-gray-800 cursor-pointer"
          >
            <option value="" disabled>اختر الولاية</option>
            {sudanStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Phone Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-600 transition-colors">
            <Phone size={20} />
          </div>
          <input
            type="tel"
            required
            placeholder="رقم الهاتف"
            dir="ltr"
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-right text-gray-800"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-yellow-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>إرسال البيانات</span>
            <Send size={18} className="rotate-180" />
          </>
        )}
      </button>
    </form>
  );
};
