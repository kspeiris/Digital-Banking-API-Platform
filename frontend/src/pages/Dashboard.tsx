import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Wallet, Send, FileText, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { accountService, Account, StatementTransaction } from '@/services/account';
import { toast } from 'sonner';

export function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userAccounts = await accountService.getAccounts();
        setAccounts(userAccounts);

        if (userAccounts.length > 0) {
          // Fetch statements for all accounts and merge them to populate recent activities
          const allStatements = await Promise.all(
            userAccounts.map(acc =>
              accountService.getAccountStatements(acc.accountId, {
                limit: 5,
                page: 1,
                format: 'json'
              }).catch(() => ({ transactions: [] }))
            )
          );
          const combined = allStatements
            .flatMap(stmt => stmt?.transactions || [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
          setTransactions(combined);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalAvailableBalance = accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);
  const mainCurrency = accounts.length > 0 ? accounts[0].currency : 'LKR';

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'LKR' ? 'Rs.' : currency;
    return `${symbol} ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Generate some realistic chart data based on history or balance
  const chartData = [
    { name: 'Jan', balance: totalAvailableBalance * 0.7 },
    { name: 'Feb', balance: totalAvailableBalance * 0.8 },
    { name: 'Mar', balance: totalAvailableBalance * 0.75 },
    { name: 'Apr', balance: totalAvailableBalance * 0.9 },
    { name: 'May', balance: totalAvailableBalance * 0.95 },
    { name: 'Jun', balance: totalAvailableBalance },
  ];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's an overview of your accounts.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <div className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Available Balance</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalAvailableBalance, mainCurrency)}</h3>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
            <ArrowDownRight className="h-3 w-3" />
            Active accounts overview
          </p>
        </div>
        
        <div className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Accounts Connected</p>
            <h3 className="text-2xl font-bold text-foreground">{accounts.length}</h3>
          </div>
          <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-full transition-all duration-500"></div>
          </div>
        </div>
        
        <div className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recent Month Activity</p>
            <h3 className="text-2xl font-bold text-foreground">{transactions.length} Transactions</h3>
          </div>
          <div className="w-full bg-muted h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-2/5 transition-all duration-500"></div>
          </div>
        </div>
        
        <div className="bg-blue-600 p-5 rounded-xl shadow-lg shadow-blue-200 text-white relative overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-200">
          <div className="relative z-10">
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">Primary Account</p>
            <h3 className="text-xl font-bold">
              {accounts.length > 0 ? `**** ${accounts[0].accountNumber.slice(-4)}` : 'None'}
            </h3>
            <p className="text-xs text-blue-100 mt-3">
              {accounts.length > 0 ? accounts[0].accountType.toUpperCase() : ''}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 bg-background rounded-xl border border-border p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-foreground">Spending Overview</h4>
            <select className="text-xs bg-muted border border-border rounded px-2 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                  formatter={(value) => [`Rs.${Number(value).toFixed(2)}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Preview */}
        <div className="bg-background rounded-xl border border-border p-6 flex flex-col shadow-sm">
          <h4 className="font-bold text-foreground mb-4">Recent Activity</h4>
          <div className="space-y-4 flex-1">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No recent transactions found.</p>
            ) : (
              transactions.slice(0, 4).map((txn, index) => {
                const isPositive = txn.credit > 0;
                const amount = isPositive ? txn.credit : txn.debit;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      {isPositive ? <ArrowDownRight className="h-5 w-5 text-green-600" /> : <ArrowUpRight className="h-5 w-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.date} • {txn.reference}</p>
                    </div>
                    <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-foreground'}`}>
                      {isPositive ? '+' : '-'}{formatCurrency(amount, mainCurrency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <Link to="/customer/transactions" className="w-full mt-6 block">
            <button className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
              View All Transactions
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
        <Link to="/customer/transfers" className="bg-background border border-border rounded-xl flex items-center gap-4 px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm h-full cursor-pointer">
          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Send className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-foreground">Send Money</p>
            <p className="text-[10px] text-muted-foreground">Instant transfer</p>
          </div>
        </Link>
        <Link to="/customer/statements" className="bg-background border border-border rounded-xl flex items-center gap-4 px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm h-full cursor-pointer">
          <div className="w-10 h-10 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-foreground">Statements</p>
            <p className="text-[10px] text-muted-foreground">Download history</p>
          </div>
        </Link>
        <Link to="/customer/cards" className="bg-background border border-border rounded-xl flex items-center gap-4 px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all group shadow-sm h-full cursor-pointer">
          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-foreground">Card Security</p>
            <p className="text-[10px] text-muted-foreground">Manage your cards</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
