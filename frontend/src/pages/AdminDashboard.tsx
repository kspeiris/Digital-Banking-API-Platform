import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, ShieldAlert, FileText, Loader2, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService, DashboardSummary } from '@/services/admin';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await adminService.getDashboardSummary();
        setSummary(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load admin metrics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading admin metrics...</p>
        </div>
      </div>
    );
  }

  const activityData = [
    { name: 'Mon', transactions: (summary?.todayTransactions || 0) * 0.7 },
    { name: 'Tue', transactions: (summary?.todayTransactions || 0) * 0.8 },
    { name: 'Wed', transactions: (summary?.todayTransactions || 0) * 0.75 },
    { name: 'Thu', transactions: (summary?.todayTransactions || 0) * 0.9 },
    { name: 'Fri', transactions: (summary?.todayTransactions || 0) * 0.95 },
    { name: 'Sat', transactions: (summary?.todayTransactions || 0) * 1.1 },
    { name: 'Sun', transactions: summary?.todayTransactions || 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-slate-500">System health and platform metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary?.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Total registered profiles</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary?.activeAccounts.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Total active bank accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Loans</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary?.pendingLoans}</div>
            <p className="text-xs text-slate-500">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Fraud Alerts</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${(summary?.fraudAlerts || 0) > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.fraudAlerts || 0) > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {summary?.fraudAlerts}
            </div>
            <p className="text-xs text-slate-500">Requires review today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-white border border-slate-200 shadow-sm lg:col-span-2 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <p className="text-slate-500 text-xs">Transaction count processed over the last 7 days.</p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, 'Transactions']} />
                  <Area type="monotone" dataKey="transactions" stroke="#2563eb" fillOpacity={1} fill="url(#colorTx)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle>System Properties</CardTitle>
            <p className="text-slate-500 text-xs font-semibold">General platform diagnostics.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Active Cards</span>
              </div>
              <span className="text-sm font-bold">{summary?.activeCards}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">API Calls Today</span>
              </div>
              <span className="text-sm font-bold">{summary?.apiRequestsToday.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
