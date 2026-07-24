import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowRightLeft, FileText, Share2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { accountService, Account } from '@/services/account';
import { toast } from 'sonner';

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const formatBalance = (amount: number, currency: string) => {
    const symbol = currency === 'LKR' ? 'Rs.' : currency;
    return `${symbol} ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>;
      case 'MATURING':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Maturing</Badge>;
      case 'FROZEN':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Frozen</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-50 border-slate-200">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Accounts</h1>
        <p className="text-slate-500">View and manage your bank accounts and fixed deposits.</p>
      </div>

      {accounts.length === 0 ? (
        <Card className="bg-white border border-slate-200 shadow-sm p-8 text-center">
          <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Accounts Found</h3>
          <p className="text-slate-500 text-sm">Please contact support or open an account to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card
              key={account.accountId}
              className="bg-white border border-slate-200 shadow-sm flex flex-col hover:border-blue-300 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1).toLowerCase()} Account</CardTitle>
                      <CardDescription>**** {account.accountNumber.slice(-4)}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(account.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
                  <h3 className="text-3xl font-bold text-slate-900">
                    {formatBalance(account.availableBalance, account.currency)}
                  </h3>
                  {account.accountType.toUpperCase() === 'SAVINGS' && (
                    <p className="text-xs text-green-600 mt-1">4.5% APY</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/customer/transfers', { state: { sourceAccountId: account.accountId } })}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customer/statements?accountId=${account.accountId}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Statement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
