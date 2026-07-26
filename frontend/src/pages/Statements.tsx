import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { accountService, Account, StatementTransaction } from '@/services/account';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

export function Statements() {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  
  // Date range state (defaults to last 30 days)
  const [fromDateStr, setFromDateStr] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [toDateStr, setToDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState(true);
  const [fetchingStatement, setFetchingStatement] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
        if (data.length > 0) {
          const queryAccountId = searchParams.get('accountId');
          const matched = data.find((acc) => acc.accountId === queryAccountId);
          setSelectedAccountId(matched ? matched.accountId : data[0].accountId);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, [searchParams]);

  // Fetch statement automatically when account is selected or date changes
  useEffect(() => {
    if (selectedAccountId) {
      fetchStatement();
    }
  }, [selectedAccountId, fromDateStr, toDateStr]);

  const fetchStatement = async () => {
    setFetchingStatement(true);
    try {
      const data = await accountService.getAccountStatements(selectedAccountId, {
        from: fromDateStr,
        to: toDateStr,
        format: 'json',
        limit: 100
      });
      setTransactions(data.transactions || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch statement transactions');
    } finally {
      setFetchingStatement(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    const activeAccount = accounts.find(a => a.accountId === selectedAccountId);
    if (!activeAccount) return;

    const toastId = toast.loading(`Generating and downloading ${format.toUpperCase()} statement...`);
    try {
      const blob = await accountService.getAccountStatements(selectedAccountId, {
        from: fromDateStr,
        to: toDateStr,
        format
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `statement-${activeAccount.accountNumber}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success(`${format.toUpperCase()} statement downloaded successfully`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to download statement', { id: toastId });
    }
  };

  const activeAccount = accounts.find((a) => a.accountId === selectedAccountId);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Statements & Documents</h1>
          <p className="text-muted-foreground">Download your monthly account statements and tax documents.</p>
        </div>
      </div>

      <Card className="bg-background border border-border shadow-sm">
        <CardHeader className="border-b bg-muted">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => {
                    const typeName = acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase();
                    const last4 = acc.accountNumber.slice(-4);
                    const balance = acc.availableBalance?.toLocaleString('en-LK', { minimumFractionDigits: 2 });
                    const statusFlag = acc.status.toUpperCase() !== 'ACTIVE' ? ` [⚠ ${acc.status}]` : '';
                    const label = `${typeName} • ****${last4} — ${acc.currency} ${balance}${statusFlag}`;
                    return (
                      <SelectItem key={acc.accountId} value={acc.accountId}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">From:</span>
                <input
                  type="date"
                  value={fromDateStr}
                  onChange={(e) => setFromDateStr(e.target.value)}
                  className="border border-border rounded px-2 py-1 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">To:</span>
                <input
                  type="date"
                  value={toDateStr}
                  onChange={(e) => setToDateStr(e.target.value)}
                  className="border border-border rounded px-2 py-1 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button variant="outline" size="sm" onClick={() => handleDownload('excel')}>
                <Download className="mr-2 h-4 w-4" /> Excel
              </Button>
              <Button size="sm" onClick={() => handleDownload('pdf')}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {fetchingStatement ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-foreground">No transactions in this period</p>
              <p className="text-xs text-muted-foreground mt-1">Try expanding the date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b border-slate-100 text-muted-foreground font-semibold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Debit</th>
                    <th className="p-4 text-right">Credit</th>
                    <th className="p-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-foreground">
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-muted transition-colors">
                      <td className="p-4 whitespace-nowrap">{tx.date}</td>
                      <td className="p-4 font-mono text-xs">{tx.reference}</td>
                      <td className="p-4">{tx.description}</td>
                      <td className="p-4 text-right text-red-600">
                        {tx.debit > 0 ? `-${tx.debit.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4 text-right text-green-600">
                        {tx.credit > 0 ? `+${tx.credit.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {activeAccount ? activeAccount.currency : ''} {tx.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
        <FileText className="w-6 h-6 text-blue-600 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-900 text-lg">Looking for Tax Documents?</h3>
          <p className="text-blue-700 mt-1 mb-4">
            Your 1099-INT and other end-of-year tax documents are available in the Tax Center starting January 31st each year.
          </p>
          <Button variant="outline" className="bg-background hover:bg-muted">Go to Tax Center</Button>
        </div>
      </div>
    </div>
  );
}
