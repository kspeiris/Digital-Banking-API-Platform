import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Wallet, Send, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', balance: 4000, income: 2400, expense: 1400 },
  { name: 'Feb', balance: 4500, income: 1398, expense: 2210 },
  { name: 'Mar', balance: 5200, income: 9800, expense: 2290 },
  { name: 'Apr', balance: 4800, income: 3908, expense: 2000 },
  { name: 'May', balance: 6100, income: 4800, expense: 2181 },
  { name: 'Jun', balance: 7500, income: 3800, expense: 2500 },
];

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500">Welcome back. Here's an overview of your accounts.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Available Balance</p>
            <h3 className="text-2xl font-bold text-slate-900">Rs. 7,500.00</h3>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3 w-3" />
            +20.1% from last month
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Monthly Income</p>
            <h3 className="text-2xl font-bold text-slate-900">Rs. 3,800.00</h3>
          </div>
          <div className="w-full bg-slate-100 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-3/4"></div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Monthly Expenses</p>
            <h3 className="text-2xl font-bold text-slate-900">Rs. 2,500.00</h3>
          </div>
          <div className="w-full bg-slate-100 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-2/5"></div>
          </div>
        </div>
        
        <div className="bg-blue-600 p-5 rounded-xl shadow-lg shadow-blue-200 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">Active Card</p>
            <h3 className="text-xl font-bold">**** 4412</h3>
            <p className="text-xs text-blue-100 mt-3">Exp: 12/26</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-900">Spending Overview</h4>
            <select className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  formatter={(value) => [`Rs.${value}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4">Recent Activity</h4>
          <div className="space-y-4 flex-1">
            {[
              { id: 1, name: 'Amazon.com', type: 'Shopping', amount: -124.50, date: 'Today, 2:34 PM' },
              { id: 2, name: 'Salary Deposit', type: 'Income', amount: 3800.00, date: 'Yesterday', positive: true },
              { id: 3, name: 'Starbucks', type: 'Food & Drink', amount: -5.40, date: 'Yesterday' },
              { id: 4, name: 'Netflix', type: 'Entertainment', amount: -15.99, date: 'Jul 18' },
            ].map((txn) => (
              <div key={txn.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  {txn.positive ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{txn.name}</p>
                  <p className="text-xs text-slate-500">{txn.date} • {txn.type}</p>
                </div>
                <span className={`text-sm font-bold ${txn.positive ? 'text-green-600' : 'text-slate-900'}`}>
                  {txn.positive ? '+' : ''}{txn.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                </span>
              </div>
            ))}
          </div>
          <Link to="/customer/transactions" className="w-full mt-6 block">
            <button className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              View All Transactions
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 lg:h-28">
        <Link to="/customer/transfers" className="bg-white border border-slate-200 rounded-xl flex items-center gap-4 px-6 py-4 hover:border-blue-300 transition-colors group shadow-sm h-full cursor-pointer">
          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Send className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-slate-900">Send Money</p>
            <p className="text-[10px] text-slate-500">Instant transfer</p>
          </div>
        </Link>
        <button className="bg-white border border-slate-200 rounded-xl flex items-center gap-4 px-6 py-4 hover:border-blue-300 transition-colors group shadow-sm h-full text-left">
          <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-slate-900">Pay Bills</p>
            <p className="text-[10px] text-slate-500">Utilities & more</p>
          </div>
        </button>
        <button className="bg-white border border-slate-200 rounded-xl flex items-center gap-4 px-6 py-4 hover:border-blue-300 transition-colors group shadow-sm h-full text-left">
          <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-slate-900">Statements</p>
            <p className="text-[10px] text-slate-500">Download history</p>
          </div>
        </button>
        <Link to="/customer/cards" className="bg-white border border-slate-200 rounded-xl flex items-center gap-4 px-6 py-4 hover:border-red-300 transition-colors group shadow-sm h-full text-left">
          <div className="w-10 h-10 shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-red-600">Security Center</p>
            <p className="text-[10px] text-slate-500">Manage your cards</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
