import type { Metadata } from "next";
import { getDashboardStats } from "@/actions/prescriptions";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentPrescriptions } from "@/components/dashboard/recent-prescriptions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Users, FileText, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s an overview of your clinic activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Prescriptions"
          value={stats.totalPrescriptions}
          icon={FileText}
          color="green"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingReviews}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved Today"
          value={stats.approvedToday}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPrescriptions />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
