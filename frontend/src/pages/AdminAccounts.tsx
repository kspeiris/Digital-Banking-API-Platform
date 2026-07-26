import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Loader2, Plus, Trash2, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { accountService, Account } from '@/services/account';
import { adminService, AdminCustomer } from '@/services/admin';
import { auth } from '@/services/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newAccount, setNewAccount] = useState({ accountNumber: '', accountType: 'SAVINGS', currency: 'LKR', branch: 'Main Branch', initialBalance: '0' });
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');

  const filteredAccounts = accounts.filter((acc) => {
    const query = accountSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      acc.accountNumber.toLowerCase().includes(query) ||
      acc.accountType.toLowerCase().includes(query) ||
      (acc.customer && (
        acc.customer.firstName.toLowerCase().includes(query) ||
        acc.customer.lastName.toLowerCase().includes(query) ||
        acc.customer.nic.toLowerCase().includes(query)
      ))
    );
  });

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

  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      return;
    }
    setCustomersLoading(true);
    try {
      const result = await adminService.searchCustomers({ page: 1, limit: 10, search: query });
      setCustomers(result.data);
    } catch (err: any) {
      console.error('Failed to search customers', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await accountService.createAccount({
        accountNumber: newAccount.accountNumber,
        accountType: newAccount.accountType,
        currency: newAccount.currency,
        branch: newAccount.branch,
        initialBalance: parseFloat(newAccount.initialBalance) || 0,
        customerId: selectedCustomerId || undefined,
      });
      toast.success('Account created successfully');
      setShowCreateDialog(false);
      setNewAccount({ accountNumber: '', accountType: 'SAVINGS', currency: 'LKR', branch: 'Main Branch', initialBalance: '0' });
      setSelectedCustomerId('');
      loadAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAccount) return;
    setActionLoading(true);
    try {
      await accountService.updateAccountStatus(selectedAccount.accountId, newStatus);
      toast.success('Account status updated successfully');
      setShowStatusDialog(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    setActionLoading(true);
    try {
      await accountService.deleteAccount(selectedAccount.accountId);
      toast.success('Account closed and deleted successfully');
      setShowDeleteDialog(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>;
      case 'FROZEN':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Frozen</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="bg-muted text-muted-foreground hover:bg-muted border-border">Closed</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground hover:bg-muted border-border">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Account Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage bank accounts for customers.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Account
        </Button>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">All Accounts</CardTitle>
              <CardDescription>Platform-wide account inventory.</CardDescription>
            </div>
             <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts or customers..."
                className="pl-9 h-9 text-sm"
                value={accountSearchQuery}
                onChange={(e) => setAccountSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Plus className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground text-sm">No accounts found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3 font-medium">Account Number</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Created At</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Balance</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.accountId} className="hover:bg-muted/80 transition-colors">
                      <td className="p-3 font-mono text-xs">{acc.accountNumber}</td>
                      <td className="p-3">{acc.accountType}</td>
                      <td className="p-3 text-xs">
                        {acc.customer ? (
                          <div>
                            <p className="font-semibold text-foreground">{acc.customer.firstName} {acc.customer.lastName}</p>
                            <p className="text-muted-foreground text-[10px]">{acc.customer.nic}</p>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="p-3">{getStatusBadge(acc.status)}</td>
                      <td className="p-3 text-right font-medium text-xs">
                        {acc.currency} {acc.balance.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedAccount(acc); setNewStatus(acc.status); setShowStatusDialog(true); }}
                            className="h-8 text-xs"
                          >
                            <Shield className="mr-1 h-3.5 w-3.5" /> Status
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedAccount(acc); setShowDeleteDialog(true); }}
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>Open a new bank account for a customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerSearch">Customer (optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customerSearch"
                  placeholder="Search customer by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {customersLoading && <p className="text-xs text-muted-foreground">Searching...</p>}
              {customers.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow-sm">
                  <p className="text-xs text-muted-foreground px-2 pt-2 pb-1">{customers.length} result{customers.length !== 1 ? 's' : ''} found</p>
                  {customers.map((c) => (
                    <div
                      key={c.customerId}
                      className={`px-3 py-2 cursor-pointer hover:bg-muted text-sm border-t border-border ${selectedCustomerId === c.customerId ? 'bg-blue-50 font-medium' : ''}`}
                      onClick={() => { setSelectedCustomerId(c.customerId); setSearchQuery(`${c.name} (${c.email})`); setCustomers([]); }}
                    >
                      <p className="text-foreground font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedCustomerId && (
                <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-800 truncate">{searchQuery}</p>
                    <p className="text-[10px] text-blue-500">Customer selected ✓</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedCustomerId(''); setSearchQuery(''); setCustomers([]); }}
                    className="text-blue-400 hover:text-blue-700 shrink-0 text-sm font-bold"
                    aria-label="Clear selection"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number <span className="text-muted-foreground font-normal text-xs">(e.g. ACC-2026-001)</span></Label>
              <Input id="accountNumber" required value={newAccount.accountNumber} onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })} placeholder="e.g. ACC-2026-001" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={newAccount.accountType} onValueChange={(v) => setNewAccount({ ...newAccount, accountType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={newAccount.currency} onValueChange={(v) => setNewAccount({ ...newAccount, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR — Sri Lankan Rupee</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" required value={newAccount.branch} onChange={(e) => setNewAccount({ ...newAccount, branch: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">Initial Deposit (LKR) <span className="text-muted-foreground font-normal text-xs">— can be 0</span></Label>
              <Input id="initialBalance" type="number" min="0" required value={newAccount.initialBalance} onChange={(e) => setNewAccount({ ...newAccount, initialBalance: e.target.value })} placeholder="0" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreateDialog(false); setSelectedCustomerId(''); setSearchQuery(''); }}>Cancel</Button>
              <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Create Account'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Account Status</DialogTitle>
            <DialogDescription>Change the status for account {selectedAccount?.accountNumber}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="FROZEN">Frozen</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
              <Button type="button" onClick={handleStatusUpdate} disabled={actionLoading}>Update Status</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description={`Are you sure you want to delete account ${selectedAccount?.accountNumber}? This action cannot be undone.`}
        confirmLabel="Delete Account"
        variant="destructive"
        loading={actionLoading}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
