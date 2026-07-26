import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ArrowRightLeft, FileText, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { accountService, Account } from '@/services/account';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [openingAccount, setOpeningAccount] = useState(false);
  const [newAccountType, setNewAccountType] = useState('SAVINGS');
  const [newCurrency, setNewCurrency] = useState('LKR');
  const [newBranch, setNewBranch] = useState('');
  const navigate = useNavigate();

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleOpenAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningAccount(true);
    try {
      // Generate a simple account number client-side (backend may override)
      const generatedNumber = `ACC${Date.now().toString().slice(-10)}`;
      await accountService.createAccount({
        accountNumber: generatedNumber,
        accountType: newAccountType,
        currency: newCurrency,
        branch: newBranch || undefined,
        initialBalance: 0,
      });
      toast.success(`${newAccountType.charAt(0) + newAccountType.slice(1).toLowerCase()} account opened successfully!`);
      setShowOpenDialog(false);
      setNewAccountType('SAVINGS');
      setNewCurrency('LKR');
      setNewBranch('');
      loadAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to open account');
    } finally {
      setOpeningAccount(false);
    }
  };

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
        return <Badge variant="outline" className="bg-muted text-muted-foreground hover:bg-muted border-border">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">View and manage your bank accounts and fixed deposits.</p>
        </div>
        <Button onClick={() => setShowOpenDialog(true)} className="w-fit">
          <Plus className="mr-2 h-4 w-4" /> Open New Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="bg-background border border-border shadow-sm p-8 text-center">
          <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">No Accounts Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Open your first account to start banking with Nexus.</p>
          <Button onClick={() => setShowOpenDialog(true)} className="mx-auto">
            <Plus className="mr-2 h-4 w-4" /> Open First Account
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card
              key={account.accountId}
              className="bg-background border border-border shadow-sm flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1).toLowerCase()} Account</CardTitle>
                      <CardDescription>**** {account.accountNumber.slice(-4)}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(account.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Available Balance</p>
                  <h3 className="text-2xl font-bold text-foreground">
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
                    className="transition-colors"
                    disabled={account.status.toUpperCase() !== 'ACTIVE'}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customer/statements?accountId=${account.accountId}`)}
                    className="transition-colors"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Statement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Open Account Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open New Account</DialogTitle>
            <DialogDescription>
              Choose an account type and currency. Your account will be opened instantly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOpenAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select value={newAccountType} onValueChange={setNewAccountType}>
                <SelectTrigger id="accountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings Account</SelectItem>
                  <SelectItem value="CURRENT">Current Account</SelectItem>
                  <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newAccountType === 'SAVINGS' && 'Earn 4.5% APY on your balance.'}
                {newAccountType === 'CURRENT' && 'Everyday transaction account with no withdrawal limits.'}
                {newAccountType === 'FIXED_DEPOSIT' && 'Locked term deposit with higher interest rates.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={newCurrency} onValueChange={setNewCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR — Sri Lankan Rupee</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch (Optional)</Label>
              <Input
                id="branch"
                placeholder="e.g. Colombo 03"
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
              />
            </div>
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
              Your new account will open with a zero balance. You can fund it via a transfer from an existing account.
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={openingAccount}>
                {openingAccount ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening...</>
                ) : (
                  'Open Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
