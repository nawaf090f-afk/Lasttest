import React, { useState } from 'react';
import { X, MapPin, DollarSign, Send, FileText } from 'lucide-react';
import { madaniAreas } from '../data/madaniAreas';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewRequestModal = ({ isOpen, onClose, onSuccess }: NewRequestModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    fromArea: '',
    toArea: '',
    price: '',
  });

  // حساب العمولة (مثلاً 10% من السعر)
  const commission = formData.price ? (parseFloat(formData.price) * 0.1).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // انتهاء بعد 5 دقائق

      const { error } = await supabase
        .from('delivery_requests')
        .insert([
          {
            user_phone: user?.phone, // ربط الطلب برقم هاتف المستخدم
            sender_name: user?.name,
            content: formData.content,
            from_area: formData.fromArea,
            to_area: formData.toArea,
            price: parseFloat(formData.price),
            commission: parseFloat(commission),
            status: 'pending',
            expires_at: expiresAt.toISOString()
          }
        ]);

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData({ content: '', fromArea: '', toArea: '', price: '' });
    } catch (error) {
      console.error('Error creating request:', error);
      alert('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-yellow-400 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
            <Send size={20} />
            طلب مرسال جديد
          </h3>
          <button onClick={onClose} className="text-yellow-900 hover:bg-yellow-500/20 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* تفاصيل المرسال */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText size={16} />
              تفاصيل المرسال
            </label>
            <textarea
              required
              rows={3}
              placeholder="اكتب تفاصيل الغرض المراد توصيله..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* من */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-green-600" />
                من (الحي)
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none appearance-none"
                value={formData.fromArea}
                onChange={e => setFormData({ ...formData, fromArea: e.target.value })}
              >
                <option value="">اختر الحي</option>
                {madaniAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* إلى */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-red-600" />
                إلى (الحي)
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none appearance-none"
                value={formData.toArea}
                onChange={e => setFormData({ ...formData, toArea: e.target.value })}
              >
                <option value="">اختر الحي</option>
                {madaniAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* السعر */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign size={16} />
                السعر المقترح
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="0.00"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            {/* العمولة */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-yellow-600" />
                عمولة الموقع (10%)
              </label>
              <div className="w-full p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 font-bold">
                {commission} ج.س
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 flex justify-center items-center gap-2"
          >
            {loading ? 'جاري النشر...' : 'نشر الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
};
