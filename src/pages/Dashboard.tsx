import React, { useState, useEffect } from 'react';
import { RecordingIndicator } from '../components/RecordingIndicator';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Wallet, ShoppingBag } from 'lucide-react';
import { NewRequestModal } from '../components/NewRequestModal';
import { RequestCard } from '../components/RequestCard';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // إعداد اشتراك للبيانات الحية (اختياري، هنا سنكتفي بالتحديث اليدوي عند الإضافة)
    const interval = setInterval(fetchRequests, 10000); // تحديث كل 10 ثواني
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-400 relative flex flex-col" dir="rtl">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-200 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4 flex justify-between items-center">
        <RecordingIndicator />
        <div className="flex items-center gap-3">
          <div className="text-yellow-900 font-bold hidden sm:block">
            {user?.name}
          </div>
          <button 
            onClick={logout}
            className="bg-white/40 hover:bg-white/60 p-2 rounded-full transition-colors text-yellow-900 backdrop-blur-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 px-4 pb-20 max-w-2xl mx-auto w-full">
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-yellow-50 text-yellow-900 p-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3 group"
          >
            <div className="bg-yellow-100 p-4 rounded-full group-hover:bg-yellow-200 transition-colors">
              <Plus size={32} className="text-yellow-700" />
            </div>
            <span className="font-bold text-lg">طلب مرسال جديد</span>
          </button>

          <button 
            className="bg-yellow-900 hover:bg-yellow-800 text-yellow-100 p-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3 group"
          >
            <div className="bg-yellow-800 p-4 rounded-full group-hover:bg-yellow-700 transition-colors">
              <Wallet size={32} className="text-yellow-200" />
            </div>
            <span className="font-bold text-lg">المحفظة / طلباتي</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="text-yellow-900" />
            <h3 className="text-xl font-bold text-yellow-900">الطلبات النشطة</h3>
          </div>

          {loading ? (
            <div className="text-center py-10 text-yellow-800">جاري تحميل الطلبات...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 bg-white/30 rounded-2xl backdrop-blur-sm border border-yellow-500/20">
              <p className="text-yellow-900 font-medium">لا توجد طلبات نشطة حالياً</p>
              <p className="text-yellow-800/60 text-sm mt-1">كن أول من يطلب!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <RequestCard key={req.id} request={req} onRefresh={fetchRequests} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <NewRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRequests}
      />

      <footer className="text-center py-4 text-yellow-800/60 text-sm font-medium relative z-10">
        &copy; 2025 تطبيق رسلني
      </footer>
    </div>
  );
};
