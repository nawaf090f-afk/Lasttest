import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RecordingIndicator } from '../components/RecordingIndicator';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Plus, Wallet, ShoppingBag, Bell, BellOff, Volume2 } from 'lucide-react';
import { NewRequestModal } from '../components/NewRequestModal';
import { RequestCard } from '../components/RequestCard';
import { supabase } from '../lib/supabase';

// Sound URL (Simple notification beep)
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const Dashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Agent Work Mode State
  const [isWorking, setIsWorking] = useState(() => {
    const saved = localStorage.getItem('agent_work_mode');
    return saved ? JSON.parse(saved) : true;
  });

  // Notification State
  const [showNotification, setShowNotification] = useState(false);
  const previousRequestsRef = useRef<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const toggleWorkMode = (mode: boolean) => {
    setIsWorking(mode);
    localStorage.setItem('agent_work_mode', JSON.stringify(mode));
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('delivery_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Visibility Logic
      if (user?.role === 'client') {
        // Clients see ONLY their own requests (pending or accepted)
        query = query.eq('user_phone', user.phone);
      } else {
        // Agents see ALL pending requests
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const newRequests = data || [];

      // Logic for Notifications (Sound & Visual)
      if (previousRequestsRef.current.length > 0) {
        
        // 1. Agent Logic: New Pending Request
        if (user?.role === 'agent' && isWorking) {
          // Check if there are MORE requests than before (simple check for new additions)
          // Or check if a new ID exists that wasn't there before
          const hasNewRequest = newRequests.some(nr => 
            !previousRequestsRef.current.find(pr => pr.id === nr.id)
          );

          if (hasNewRequest) {
            playNotificationSound();
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
          }
        }

        // 2. Client Logic: Request Accepted
        if (user?.role === 'client') {
          const hasAcceptedRequest = newRequests.some(nr => 
            nr.status === 'accepted' && 
            previousRequestsRef.current.find(pr => pr.id === nr.id)?.status === 'pending'
          );

          if (hasAcceptedRequest) {
            playNotificationSound();
            setShowNotification(true); // Re-use notification state for client alert
            setTimeout(() => setShowNotification(false), 5000);
          }
        }
      }

      setRequests(newRequests);
      previousRequestsRef.current = newRequests;

    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Live update subscription
    const interval = setInterval(fetchRequests, 5000); // Check every 5 seconds for faster alerts
    return () => clearInterval(interval);
  }, [user?.role, user?.phone, isWorking]);

  return (
    <div className="min-h-screen bg-yellow-400 relative flex flex-col" dir="rtl">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-200 rounded-full blur-3xl"></div>
      </div>

      {/* Red Notification Banner */}
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center font-bold shadow-lg animate-in slide-in-from-top duration-300 flex items-center justify-center gap-2">
          <Volume2 className="animate-pulse" />
          {user?.role === 'agent' ? 'يوجد طلب جديد!' : 'تم قبول طلبك!'}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4 flex justify-between items-center">
        <RecordingIndicator />
        <Link 
          to="/profile"
          className="flex items-center gap-2 bg-white/40 hover:bg-white/60 py-2 px-3 rounded-full transition-all text-yellow-900 backdrop-blur-sm group"
        >
          <div className="text-right">
             <div className="font-bold hidden sm:block group-hover:text-yellow-800 text-sm">
              {user?.name}
            </div>
            <div className="text-xs text-yellow-800/70 font-medium">
              {user?.role === 'agent' ? 'مندوب توصيل' : 'عميل'}
            </div>
          </div>
          <UserCircle size={24} />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 px-4 pb-20 max-w-2xl mx-auto w-full">
        
        {/* Agent Work Mode Controls */}
        {user?.role === 'agent' && (
          <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl mb-6 border border-yellow-500/20">
            <h3 className="text-yellow-900 font-bold mb-3 text-sm">حالة العمل:</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => toggleWorkMode(true)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                  isWorking 
                    ? 'bg-green-500 text-white shadow-lg scale-105' 
                    : 'bg-white/50 text-gray-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <Bell size={18} />
                  وضع العمل
                </div>
                <span className="text-[10px] mt-1 opacity-90">استلام اشعارات وصوت</span>
              </button>

              <button 
                onClick={() => toggleWorkMode(false)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                  !isWorking 
                    ? 'bg-red-500 text-white shadow-lg scale-105' 
                    : 'bg-white/50 text-gray-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <BellOff size={18} />
                  وضع الراحة
                </div>
                <span className="text-[10px] mt-1 opacity-90">لا يوجد تنبيهات</span>
              </button>
            </div>
          </div>
        )}
        
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
            <div className="text-center">
              <span className="font-bold text-lg block">المحفظة</span>
              <span className="text-yellow-300 text-sm font-medium mt-1 block dir-ltr">
                رصيدي: 0.00 ج.س
              </span>
            </div>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="text-yellow-900" />
            <h3 className="text-xl font-bold text-yellow-900">
              {user?.role === 'client' ? 'طلباتي' : 'الطلبات النشطة'}
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-10 text-yellow-800">جاري تحميل الطلبات...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 bg-white/30 rounded-2xl backdrop-blur-sm border border-yellow-500/20">
              <p className="text-yellow-900 font-medium">
                {user?.role === 'client' 
                  ? 'ليس لديك طلبات حالياً' 
                  : 'لا توجد طلبات نشطة من العملاء'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <RequestCard 
                  key={req.id} 
                  request={req} 
                  onRefresh={fetchRequests} 
                  // Pass role to card if needed to hide buttons for client, 
                  // though RequestCard logic might need slight tweak if clients shouldn't see accept/ignore buttons
                  // For now, assuming RequestCard handles basic display.
                  // We should probably hide action buttons for clients in RequestCard.
                />
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
