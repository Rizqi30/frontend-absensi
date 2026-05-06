"use client";

import React from 'react';
import { 
  CalendarCheck, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Target,
  CheckCircle2
} from 'lucide-react';

// Interfaces
export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  trend: number; // percentage, positive or negative
  trendLabel: string;
  iconType: 'calendar' | 'clock' | 'alert' | 'check';
}

export interface WeeklyData {
  day: string; // e.g., 'Mon'
  hours: number;
}

export interface StatsOverviewProps {
  stats?: StatItem[];
  weeklyData?: WeeklyData[];
  monthlyGoalProgress?: number; // 0 to 100
}

// Mock Data Defaults
const MOCK_STATS: StatItem[] = [
  {
    id: '1',
    label: 'Total Attendance',
    value: '22',
    trend: 4.5,
    trendLabel: 'vs last month',
    iconType: 'calendar',
  },
  {
    id: '2',
    label: 'Avg. Work Hours',
    value: '8.4h',
    trend: 1.2,
    trendLabel: 'vs last month',
    iconType: 'clock',
  },
  {
    id: '3',
    label: 'Late Arrivals',
    value: '2',
    trend: -12.5, // Decrease in lates is good, but structurally it's a negative number. We handle coloring in render.
    trendLabel: 'vs last month',
    iconType: 'alert',
  },
  {
    id: '4',
    label: 'On-Time Rate',
    value: '91%',
    trend: 2.1,
    trendLabel: 'vs last month',
    iconType: 'check',
  },
];

const MOCK_WEEKLY: WeeklyData[] = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 9.0 },
  { day: 'Wed', hours: 8.2 },
  { day: 'Thu', hours: 8.8 },
  { day: 'Fri', hours: 7.5 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
];

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const StatsOverview: React.FC<StatsOverviewProps> = () => {
  // Fetch real data from Laravel backend
  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances'],
    queryFn: async () => {
      const response = await api.get('/attendances');
      return response.data;
    }
  });

  // Calculate real metrics based on the backend data
  const totalAttendance = attendances.length;
  const lateArrivals = attendances.filter((a: any) => a.check_in_status === 'Late').length;
  const onTimeRate = totalAttendance > 0 
    ? Math.round(((totalAttendance - lateArrivals) / totalAttendance) * 100) 
    : 0;

  // Build the dynamic stats array
  const dynamicStats: StatItem[] = [
    {
      id: '1',
      label: 'Total Attendance',
      value: totalAttendance.toString(),
      trend: 0, // Would need historical data to calculate true trend
      trendLabel: 'All time',
      iconType: 'calendar',
    },
    {
      id: '2',
      label: 'Avg. Work Hours',
      value: '8h', // Placeholder since we need detailed checkout times to average
      trend: 0,
      trendLabel: 'All time',
      iconType: 'clock',
    },
    {
      id: '3',
      label: 'Late Arrivals',
      value: lateArrivals.toString(),
      trend: 0, 
      trendLabel: 'All time',
      iconType: 'alert',
    },
    {
      id: '4',
      label: 'On-Time Rate',
      value: `${onTimeRate}%`,
      trend: 0,
      trendLabel: 'All time',
      iconType: 'check',
    },
  ];

  const stats = dynamicStats;
  const weeklyData = MOCK_WEEKLY; // Still using mock for the chart since backend doesn't provide weekly breakdown easily yet
  const monthlyGoalProgress = totalAttendance > 0 ? Math.min(Math.round((totalAttendance / 20) * 100), 100) : 0; // Assuming 20 days is the goal
  // Helper to render the correct icon based on iconType
  const renderIcon = (type: StatItem['iconType']) => {
    switch (type) {
      case 'calendar':
        return <CalendarCheck className="text-blue-600" size={24} strokeWidth={2} />;
      case 'clock':
        return <Clock className="text-indigo-600" size={24} strokeWidth={2} />;
      case 'alert':
        return <AlertCircle className="text-rose-600" size={24} strokeWidth={2} />;
      case 'check':
        return <CheckCircle2 className="text-emerald-600" size={24} strokeWidth={2} />;
      default:
        return <Target className="text-slate-600" size={24} strokeWidth={2} />;
    }
  };

  // Helper to get background colors for icon containers
  const getIconBg = (type: StatItem['iconType']) => {
    switch (type) {
      case 'calendar': return 'bg-blue-100/50 border-blue-200/50';
      case 'clock': return 'bg-indigo-100/50 border-indigo-200/50';
      case 'alert': return 'bg-rose-100/50 border-rose-200/50';
      case 'check': return 'bg-emerald-100/50 border-emerald-200/50';
      default: return 'bg-slate-100/50 border-slate-200/50';
    }
  };

  // Find max hours for the bar chart scale
  const maxWeeklyHours = Math.max(...weeklyData.map(d => d.hours), 10); // Minimum scale of 10

  // Circular progress math (radius 40, circumference ~251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (monthlyGoalProgress / 100) * circumference;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Row: Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          // Determine if trend is "good" or "bad". 
          // Decrease in Late Arrivals is Good (negative trend = green). Otherwise, positive trend = green.
          const isInvertedLogic = stat.iconType === 'alert';
          const isTrendPositive = stat.trend > 0;
          const isGood = isInvertedLogic ? !isTrendPositive : isTrendPositive;
          
          return (
            <div 
              key={stat.id}
              className="bg-white rounded-2xl border border-slate-100/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getIconBg(stat.iconType)}`}>
                  {renderIcon(stat.iconType)}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span 
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                      isGood ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}
                  >
                    {isTrendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(stat.trend)}%
                  </span>
                  <span className="text-xs text-slate-400">{stat.trendLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: Charts & Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Progress Bar Chart (Tailwind CSS Only) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Weekly Hours Worked</h3>
              <p className="text-sm text-slate-500 mt-0.5">Overview of your productive hours this week.</p>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4">
            {weeklyData.map((data, idx) => {
              const heightPercent = (data.hours / maxWeeklyHours) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  {/* Tooltip & Bar */}
                  <div className="relative w-full h-full flex flex-col justify-end items-center">
                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded transform transition-all duration-200 z-10 whitespace-nowrap shadow-lg">
                      {data.hours} hrs
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                    
                    {/* The Bar */}
                    <div className="w-full max-w-[40px] sm:max-w-[48px] h-full bg-slate-50 rounded-t-lg relative overflow-hidden flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg shadow-sm transition-all duration-500 ease-out group-hover:opacity-90"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* X-Axis Label */}
                  <span className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Goal Activity Ring */}
        <div className="bg-white rounded-2xl border border-slate-100/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-800">Monthly Goal</h3>
            <p className="text-sm text-slate-500 mt-0.5">Your attendance target progress.</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out drop-shadow-sm"
                />
                {/* Define Gradient */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
                    <stop offset="100%" stopColor="#6366f1" /> {/* indigo-500 */}
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Target size={24} className="text-blue-500 mb-1 opacity-80" />
                <span className="text-3xl font-bold text-slate-800">{monthlyGoalProgress}%</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">Achieved</span>
              </div>
            </div>
          </div>
          
          {/* Footer of the ring card */}
          <div className="mt-4 flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-slate-500 font-medium">Target: 160h</span>
            <span className="text-blue-600 font-bold">{Math.round((monthlyGoalProgress / 100) * 160)}h Logged</span>
          </div>
        </div>

      </div>
    </div>
  );
};
