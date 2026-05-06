"use client";

import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, FileX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Attendance } from '@/types/attendance';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave';

export interface AttendanceLog {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workHours: string | null;
}

export const AttendanceHistoryTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from Laravel backend
  const { data: attendances = [], isLoading } = useQuery({
    queryKey: ['attendances'],
    queryFn: async () => {
      const response = await api.get('/attendances');
      return response.data;
    },
    select: (data) => {
      if (!Array.isArray(data)) return [];
      
      return data.map((item: Attendance) => {
        // Map backend status to our frontend status badges
        let status: AttendanceStatus = 'Present';
        if (item.check_in_status === 'Late') status = 'Late';

        // Calculate work hours if both checkIn and checkOut exist
        let workHours = null;
        if (item.clock_in && item.clock_out) {
          const inTime = new Date(`2000-01-01T${item.clock_in}`);
          const outTime = new Date(`2000-01-01T${item.clock_out}`);
          const diffMs = outTime.getTime() - inTime.getTime();
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          workHours = `${diffHrs}h ${diffMins}m`;
        }

        const recordDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return {
          id: item.attendance_id,
          date: recordDate,
          checkIn: item.clock_in,
          checkOut: item.clock_out,
          status,
          workHours,
        };
      });
    }
  });

  // Filter logs based on date or status
  const filteredLogs = useMemo(() => {
    return attendances.filter((log: AttendanceLog) => {
      const lowerQuery = searchQuery.toLowerCase();
      return (
        log.date.toLowerCase().includes(lowerQuery) ||
        log.status.toLowerCase().includes(lowerQuery)
      );
    });
  }, [searchQuery, attendances]);

  // Helper function to render status badges
  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/50">
            Absent
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            On Leave
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
      {/* Header and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Attendance History</h2>
          <p className="text-sm text-slate-500 mt-1">Review your recent check-in logs and status.</p>
        </div>
        
        <div className="relative w-full sm:w-64 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by date or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full py-2 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none placeholder:text-slate-400 text-slate-700 transition-all"
          />
        </div>
      </div>

      {/* Table Container with overflow for mobile */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Check In</th>
              <th className="py-4 px-6 font-semibold">Check Out</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Work Hours</th>
              <th className="py-4 px-6 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log: AttendanceLog) => (
                <tr 
                  key={log.id} 
                  className="border-b border-slate-50 last:border-none hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-4 px-6 text-sm font-medium text-slate-800 whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                    {log.checkIn ? (
                      log.checkIn
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                    {log.checkOut ? (
                      log.checkOut
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {renderStatusBadge(log.status)}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                    {log.workHours ? (
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                        {log.workHours}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50/0 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200">
                      Detail
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 px-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <FileX className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">No logs found</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      We couldn't find any attendance logs matching your search.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
