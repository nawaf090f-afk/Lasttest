import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Check, X, User, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface RequestProps {
  request: {
    id: number;
    sender_name: string;
    content: string;
    from_area: string;
    to_area: string;
    price: number;
    commission: number;
    expires_at: string;
    status: string;
  };
  onRefresh: () => void;
}

export const RequestCard = ({ request, onRefresh }: RequestProps) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Only run timer for pending requests
    if (request.status !== 'pending') {
        setTimeLeft(request.status === 'accepted' ? 'تم القبول' : 'ملغي/منتهي');
        return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expirationTime = new Date(request.expires_at).getTime();
      const distance = expirationTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsExpired(true);
        setTimeLeft('انتهى الوقت');
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [request.expires_at, request.status]);

  const handleAction = async (action: 'accept' | 'ignore') => {
    if (action === 'ignore') {
       await supabase.from('delivery_requests').update({ status: 'ignored' }).eq('id', request.id);
    } else {
       await supabase.from('delivery_requests').update({ status: 'accepted' }).eq('id', request.id);
    }
    onRefresh();
  };

  // Hide expired requests for agents, but maybe show history for clients?
  // For simplicity based on prompt:
  if (isExpired && request.status === 'pending') return null;

  return (
    <div className={`rounded-2xl p-5 shadow-lg border relative overflow-hidden animate-in slide-in-from-bottom duration-500 ${
        request.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
    }`}>
      {/* Timer/Status Badge */}
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm ${
          request.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
      }`}>
        {request.status === 'accepted' ? <Check size={14} /> : <Clock size={14} />}
        {timeLeft}
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="bg-yellow-100 p-3 rounded-full">
          <User className="text-yellow-600" size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-lg">{request.sender_name}</h4>
          <p className="text-gray-500 text-sm mt-1">{request.content}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 bg-white/50 p-3 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-green-500" />
          <span>من: <span className="font-semibold text-gray-800">{request.from_area}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-red-500" />
          <span>إلى: <span className="font-semibold text-gray-800">{request.to_area}</span></span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-1 text-yellow-700 font-bold text-lg">
          <DollarSign size={20} />
          {request.price} ج.س
        </div>
        <div className="text-xs text-gray-400">
          العمولة: {request.commission} ج.س
        </div>
      </div>

      {/* Show Action Buttons ONLY for Agents and ONLY if Pending */}
      {user?.role === 'agent' && request.status === 'pending' && (
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction('accept')}
            className="bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-200"
          >
            <Check size={18} />
            قبول الطلب
          </button>
          <button 
            onClick={() => handleAction('ignore')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <X size={18} />
            تجاهل
          </button>
        </div>
      )}
      
      {/* Status Message for Client */}
      {user?.role === 'client' && request.status === 'accepted' && (
         <div className="w-full bg-green-100 text-green-800 py-2 rounded-xl text-center font-bold text-sm">
            تم قبول طلبك! المندوب في الطريق.
         </div>
      )}
    </div>
  );
};
