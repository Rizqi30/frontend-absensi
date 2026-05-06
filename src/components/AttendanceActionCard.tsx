"use client";

import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Timer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export interface AttendanceProps {
  initialIsCheckedIn?: boolean;
  initialIsCheckedOut?: boolean;
  initialEntryTime?: string | null;
  initialExitTime?: string | null;
  initialTotalHours?: string | null;
}

export const AttendanceActionCard: React.FC<AttendanceProps> = ({
  initialIsCheckedIn = false,
  initialIsCheckedOut = false,
  initialEntryTime = '--:-- AM',
  initialExitTime = '--:-- PM',
  initialTotalHours = '0h 0m',
}) => {
  // Clock state
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);
  const [isCheckedOut, setIsCheckedOut] = useState(initialIsCheckedOut);
  const [entryTime, setEntryTime] = useState(initialEntryTime);
  const [exitTime, setExitTime] = useState(initialExitTime);
  
  // Loading states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock functions replaced with real API logic
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      // Send real POST request to backend
      const response = await api.post('/attendances/checkin', {
        employee_id: 1 // Hardcoded for demonstration, ideally from Auth Context
      });
      
      const newAttendanceId = response.data.data.attendance_id;
      setAttendanceId(newAttendanceId);
      setIsCheckedIn(true);
      
      // Update entry time based on backend response or local time
      setEntryTime(response.data.clock_in || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Successfully checked in!');
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!attendanceId) {
      toast.error('No active attendance session found');
      return;
    }
    
    setIsCheckingOut(true);
    try {
      // Send real PUT request to backend
      const response = await api.put(`/attendances/checkout/${attendanceId}`);
      
      setIsCheckedOut(true);
      setExitTime(response.data.clock_out || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Successfully checked out!');
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message || 'Failed to check out');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Format time display
  const timeString = mounted && time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';
  const dateString = mounted && time ? time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading date...';

  return (
    <div className="w-full max-w-md p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 relative overflow-hidden group">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity"></div>
      
      {/* Header / Digital Clock Section */}
      <div className="flex flex-col items-center justify-center mb-8 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="text-blue-500" size={20} />
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Current Time
          </span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-800 tabular-nums">
          {timeString}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{dateString}</p>
      </div>

      {/* Action Buttons Section */}
      <div className="flex gap-4 mb-8 relative z-10">
        {/* Check In Button Container */}
        <div className="relative flex-1">
          {/* Pulse animation ring if not checked in */}
          {!isCheckedIn && mounted && (
            <div className="absolute inset-0 bg-emerald-400 rounded-xl animate-ping opacity-20"></div>
          )}
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn || isCheckingIn}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 ease-out
              ${isCheckedIn 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-inner' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-md hover:shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0'
              }
            `}
          >
            {isCheckingIn ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <LogIn size={20} strokeWidth={isCheckedIn ? 2 : 2.5} />
            )}
            {isCheckedIn ? 'Checked In' : 'Check In'}
          </button>
        </div>

        {/* Check Out Button */}
        <button
          onClick={handleCheckOut}
          disabled={!isCheckedIn || isCheckedOut || isCheckingOut}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 ease-out
            ${!isCheckedIn || isCheckedOut
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-inner'
              : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-md hover:shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 active:translate-y-0'
            }
          `}
        >
          {isCheckingOut ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <LogOut size={20} strokeWidth={!isCheckedIn || isCheckedOut ? 2 : 2.5} />
          )}
          {isCheckedOut ? 'Checked Out' : 'Check Out'}
        </button>
      </div>

      {/* Today's Status Indicators */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 relative z-10">
        {/* Entry Time */}
        <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100/50">
          <LogIn size={18} className="text-emerald-500 mb-1.5" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Entry</span>
          <span className={`text-sm font-bold ${isCheckedIn ? 'text-slate-700' : 'text-slate-400'}`}>
            {isCheckedIn ? entryTime : '--:--'}
          </span>
        </div>

        {/* Exit Time */}
        <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100/50">
          <LogOut size={18} className="text-rose-500 mb-1.5" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Exit</span>
          <span className={`text-sm font-bold ${isCheckedOut ? 'text-slate-700' : 'text-slate-400'}`}>
            {isCheckedOut ? exitTime : '--:--'}
          </span>
        </div>

        {/* Total Hours */}
        <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <Timer size={18} className="text-blue-500 mb-1.5" />
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Total</span>
          <span className={`text-sm font-bold ${isCheckedOut ? 'text-blue-700' : 'text-blue-400'}`}>
            {isCheckedOut ? initialTotalHours : '-- h -- m'}
          </span>
        </div>
      </div>
    </div>
  );
};
