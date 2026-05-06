import { StatsOverview } from '@/components/StatsOverview';
import { AttendanceActionCard } from '@/components/AttendanceActionCard';
import { AttendanceHistoryTable } from '@/components/AttendanceHistoryTable';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header & Stats Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back, User</h1>
        <StatsOverview />
      </div>

      {/* 2. Action & History Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Action Card */}
        <div className="xl:col-span-1">
          <AttendanceActionCard />
        </div>
        
        {/* History Table */}
        <div className="xl:col-span-2 overflow-hidden">
          <AttendanceHistoryTable />
        </div>
      </div>
    </div>
  );
}