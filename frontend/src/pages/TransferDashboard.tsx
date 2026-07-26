import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRightLeft, CalendarClock, Globe, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { accountService, Account } from '@/services/account';
import { beneficiaryService } from '@/services/beneficiary';
import { transactionService } from '@/services/transaction';
import { auth } from '@/services/auth';

interface BeneficiaryOption {
  beneficiaryId: string;
  nickname: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export function TransferDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferType, setTransferType] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryOption[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);

  const [internalForm, setInternalForm] = useState({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
  const [externalForm, setExternalForm] = useState({ fromAccountId: '', beneficiaryId: '', amount: '', description: '' });
  const [scheduledForm, setScheduledForm] = useState({ fromAccountId: '', beneficiaryId: '', amount: '', transferDate: '', frequency: 'ONCE', description: '' });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadData() {
      const session = auth.getSession();
      const role = session?.user?.role?.toUpperCase();
      if (role !== 'CUSTOMER') {
        setLoadingAccounts(false);
        setLoadingBeneficiaries(false);
        return;
      }
      try {
        const [accts, bens] = await Promise.all([
          accountService.getAccounts(),
          beneficiaryService.getBeneficiaries(),
        ]);
        setAccounts(accts);
        setBeneficiaries(bens);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load transfer data');
      } finally {
        setLoadingAccounts(false);
        setLoadingBeneficiaries(false);
      }
    }
    loadData();
  }, []);

  // ─── Validation helpers ────────────────────────────────────────────────────

  const getAccountById = (id: string) => accounts.find(a => a.accountId === id);

  const getBalanceWarning = (accountId: string, amountStr: string): string | null => {
    const account = getAccountById(accountId);
    if (!account || !amountStr) return null;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return null;
    if (amount > account.availableBalance) {
      const avail = account.availableBalance.toLocaleString('en-LK', { minimumFractionDigits: 2 });
      return `Insufficient balance — available: ${account.currency} ${avail}`;
    }
    return null;
  };

  const getAccountStatusError = (accountId: string): string | null => {
    const account = getAccountById(accountId);
    if (!account) return null;
    const status = account.status.toUpperCase();
    if (status === 'FROZEN') return 'This account is frozen and cannot be used for transfers.';
    if (status === 'BLOCKED') return 'This account is blocked. Please contact support.';
    return null;
  };

  const validateAmount = (amountStr: string): number => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
    return amount;
  };

  // ─── Computed validation state ─────────────────────────────────────────────

  const internalFromError = getAccountStatusError(internalForm.fromAccountId);
  const internalBalanceWarn = getBalanceWarning(internalForm.fromAccountId, internalForm.amount);
  const internalBlocked = !!internalFromError;

  const externalFromError = getAccountStatusError(externalForm.fromAccountId);
  const externalBalanceWarn = getBalanceWarning(externalForm.fromAccountId, externalForm.amount);
  const externalBlocked = !!externalFromError;

  const scheduledFromError = getAccountStatusError(scheduledForm.fromAccountId);
  const scheduledBalanceWarn = getBalanceWarning(scheduledForm.fromAccountId, scheduledForm.amount);
  const scheduledBlocked = !!scheduledFromError;

  // ─── Submit handlers ───────────────────────────────────────────────────────

  const handleInternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (internalForm.fromAccountId === internalForm.toAccountId) {
      toast.error('Source and destination accounts must be different');
      return;
    }
    setTransferType('Internal Transfer');
    setShowConfirm(true);
  };

  const handleExternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferType('External Transfer');
    setShowConfirm(true);
  };

  const handleScheduledSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledForm.transferDate) {
      toast.error('Please select a transfer date');
      return;
    }
    if (scheduledForm.transferDate < today) {
      toast.error('Scheduled date cannot be in the past');
      return;
    }
    setTransferType('Scheduled Transfer');
    setShowConfirm(true);
  };

  const confirmTransfer = async () => {
    setIsSubmitting(true);
    try {
      if (transferType === 'Internal Transfer') {
        const amount = validateAmount(internalForm.amount);
        await transactionService.executeInternalTransfer({
          fromAccountId: internalForm.fromAccountId,
          toAccountId: internalForm.toAccountId,
          amount,
          description: internalForm.description || undefined,
        });
        toast.success('Internal transfer completed successfully');
        setInternalForm({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
      } else if (transferType === 'External Transfer') {
        const amount = validateAmount(externalForm.amount);
        await transactionService.executeExternalTransfer({
          fromAccountId: externalForm.fromAccountId,
          beneficiaryId: externalForm.beneficiaryId,
          amount,
          description: externalForm.description || undefined,
        });
        toast.success('External transfer completed successfully');
        setExternalForm({ fromAccountId: '', beneficiaryId: '', amount: '', description: '' });
      } else if (transferType === 'Scheduled Transfer') {
        const amount = validateAmount(scheduledForm.amount);
        await transactionService.scheduleTransfer({
          fromAccountId: scheduledForm.fromAccountId,
          beneficiaryId: scheduledForm.beneficiaryId,
          amount,
          transferDate: scheduledForm.transferDate,
          frequency: scheduledForm.frequency,
          description: scheduledForm.description || undefined,
        });
        toast.success('Transfer scheduled successfully');
        setScheduledForm({ fromAccountId: '', beneficiaryId: '', amount: '', transferDate: '', frequency: 'ONCE', description: '' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  // ─── Confirm dialog description ────────────────────────────────────────────

  const buildConfirmDescription = () => {
    if (transferType === 'Internal Transfer') {
      const from = getAccountById(internalForm.fromAccountId);
      const to = getAccountById(internalForm.toAccountId);
      const amount = parseFloat(internalForm.amount) || 0;
      return `Transfer LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })} from account ****${from?.accountNumber?.slice(-4) ?? '????'} to ****${to?.accountNumber?.slice(-4) ?? '????'}. This action will initiate the transaction immediately.`;
    }
    if (transferType === 'External Transfer') {
      const from = getAccountById(externalForm.fromAccountId);
      const ben = beneficiaries.find(b => b.beneficiaryId === externalForm.beneficiaryId);
      const amount = parseFloat(externalForm.amount) || 0;
      return `Transfer LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })} from ****${from?.accountNumber?.slice(-4) ?? '????'} to ${ben?.nickname ?? 'the beneficiary'} (${ben?.bankName ?? ''}). This action cannot be undone.`;
    }
    if (transferType === 'Scheduled Transfer') {
      const from = getAccountById(scheduledForm.fromAccountId);
      const ben = beneficiaries.find(b => b.beneficiaryId === scheduledForm.beneficiaryId);
      const amount = parseFloat(scheduledForm.amount) || 0;
      return `Schedule a ${scheduledForm.frequency.toLowerCase()} transfer of LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })} from ****${from?.accountNumber?.slice(-4) ?? '????'} to ${ben?.nickname ?? 'the beneficiary'} starting ${scheduledForm.transferDate}.`;
    }
    return 'Are you sure you want to proceed with this transfer?';
  };

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderAccountOptions = () => {
    if (loadingAccounts) return <SelectItem value="loading" disabled>Loading accounts...</SelectItem>;
    if (accounts.length === 0) return <SelectItem value="none" disabled>No accounts available</SelectItem>;
    return accounts.map((acc) => {
      const typeName = acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase();
      const last4 = acc.accountNumber.slice(-4);
      const balance = acc.availableBalance.toLocaleString('en-LK', { minimumFractionDigits: 2 });
      const statusFlag = acc.status.toUpperCase() !== 'ACTIVE' ? ` [⚠ ${acc.status}]` : '';
      const label = `${typeName} ****${last4} — ${acc.currency} ${balance}${statusFlag}`;
      return (
        <SelectItem key={acc.accountId} value={acc.accountId}>
          {label}
        </SelectItem>
      );
    });
  };

  const renderBeneficiaryOptions = () => {
    if (loadingBeneficiaries) return <SelectItem value="loading" disabled>Loading beneficiaries...</SelectItem>;
    if (beneficiaries.length === 0) return <SelectItem value="none" disabled>No beneficiaries — add one in Beneficiaries</SelectItem>;
    return beneficiaries.map((ben) => {
      const name = ben.nickname || ben.accountName || 'Unnamed beneficiary';
      const masked = ben.accountNumber ? `****${ben.accountNumber.slice(-4)}` : '';
      const label = `${name} — ${ben.bankName} ${masked}`;
      return (
        <SelectItem key={ben.beneficiaryId} value={ben.beneficiaryId}>
          {label}
        </SelectItem>
      );
    });
  };

  const BalanceWarning = ({ message }: { message: string | null }) =>
    message ? (
      <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        {message}
      </div>
    ) : null;

  const AccountError = ({ message }: { message: string | null }) =>
    message ? (
      <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
        <XCircle className="h-3.5 w-3.5 shrink-0" />
        {message}
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Funds</h1>
        <p className="text-muted-foreground">Move money internally, externally, or schedule future transfers.</p>
      </div>

      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
          <TabsTrigger value="internal" className="flex gap-2"><ArrowRightLeft className="h-4 w-4" /> Internal</TabsTrigger>
          <TabsTrigger value="external" className="flex gap-2"><Globe className="h-4 w-4" /> External</TabsTrigger>
          <TabsTrigger value="scheduled" className="flex gap-2"><CalendarClock className="h-4 w-4" /> Scheduled</TabsTrigger>
        </TabsList>

        {/* ── Internal Transfer ── */}
        <TabsContent value="internal">
          <Card>
            <CardHeader>
              <CardTitle>Internal Transfer</CardTitle>
              <CardDescription>Transfer money between your own Nexus Banking accounts instantly.</CardDescription>
            </CardHeader>
            <form onSubmit={handleInternalSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select required value={internalForm.fromAccountId} onValueChange={(v) => setInternalForm({ ...internalForm, fromAccountId: v, amount: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select source account" /></SelectTrigger>
                    <SelectContent>{renderAccountOptions()}</SelectContent>
                  </Select>
                  <AccountError message={internalFromError} />
                </div>
                <div className="space-y-2">
                  <Label>To Account</Label>
                  <Select required value={internalForm.toAccountId} onValueChange={(v) => setInternalForm({ ...internalForm, toAccountId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select destination account" /></SelectTrigger>
                    <SelectContent>{renderAccountOptions()}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal-amount">Amount (LKR)</Label>
                  <Input
                    id="internal-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={internalForm.amount}
                    onChange={(e) => setInternalForm({ ...internalForm, amount: e.target.value })}
                  />
                  <BalanceWarning message={internalBalanceWarn} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal-description">Description (Optional)</Label>
                  <Input id="internal-description" type="text" placeholder="e.g. Rent payment" value={internalForm.description} onChange={(e) => setInternalForm({ ...internalForm, description: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || loadingAccounts || internalBlocked}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Confirm Transfer'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ── External Transfer ── */}
        <TabsContent value="external">
          <Card>
            <CardHeader>
              <CardTitle>External Transfer</CardTitle>
              <CardDescription>Send money to other banks or saved beneficiaries.</CardDescription>
            </CardHeader>
            <form onSubmit={handleExternalSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select required value={externalForm.fromAccountId} onValueChange={(v) => setExternalForm({ ...externalForm, fromAccountId: v, amount: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select source account" /></SelectTrigger>
                    <SelectContent>{renderAccountOptions()}</SelectContent>
                  </Select>
                  <AccountError message={externalFromError} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external-beneficiary">Beneficiary</Label>
                  <Select required value={externalForm.beneficiaryId} onValueChange={(v) => setExternalForm({ ...externalForm, beneficiaryId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select beneficiary" /></SelectTrigger>
                    <SelectContent>{renderBeneficiaryOptions()}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external-amount">Amount (LKR)</Label>
                  <Input
                    id="external-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={externalForm.amount}
                    onChange={(e) => setExternalForm({ ...externalForm, amount: e.target.value })}
                  />
                  <BalanceWarning message={externalBalanceWarn} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external-description">Description (Optional)</Label>
                  <Input id="external-description" type="text" placeholder="e.g. Rent payment" value={externalForm.description} onChange={(e) => setExternalForm({ ...externalForm, description: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || loadingAccounts || loadingBeneficiaries || externalBlocked}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Transfer'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ── Scheduled Transfer ── */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Transfer</CardTitle>
              <CardDescription>Set up recurring or future-dated transfers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleScheduledSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Account</Label>
                    <Select required value={scheduledForm.fromAccountId} onValueChange={(v) => setScheduledForm({ ...scheduledForm, fromAccountId: v, amount: '' })}>
                      <SelectTrigger><SelectValue placeholder="Select source account" /></SelectTrigger>
                      <SelectContent>{renderAccountOptions()}</SelectContent>
                    </Select>
                    <AccountError message={scheduledFromError} />
                  </div>
                  <div className="space-y-2">
                    <Label>Beneficiary</Label>
                    <Select required value={scheduledForm.beneficiaryId} onValueChange={(v) => setScheduledForm({ ...scheduledForm, beneficiaryId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select beneficiary" /></SelectTrigger>
                      <SelectContent>{renderBeneficiaryOptions()}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date">Transfer Date</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      required
                      min={today}
                      value={scheduledForm.transferDate}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, transferDate: e.target.value })}
                    />
                    {scheduledForm.transferDate && scheduledForm.transferDate < today && (
                      <p className="text-xs text-red-600">Date cannot be in the past.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={scheduledForm.frequency} onValueChange={(v) => setScheduledForm({ ...scheduledForm, frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONCE">One-time</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-amount">Amount (LKR)</Label>
                  <Input
                    id="scheduled-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={scheduledForm.amount}
                    onChange={(e) => setScheduledForm({ ...scheduledForm, amount: e.target.value })}
                  />
                  <BalanceWarning message={scheduledBalanceWarn} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-description">Description (Optional)</Label>
                  <Input id="scheduled-description" type="text" placeholder="e.g. Monthly rent" value={scheduledForm.description} onChange={(e) => setScheduledForm({ ...scheduledForm, description: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || loadingAccounts || loadingBeneficiaries || scheduledBlocked}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Schedule Transfer'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Confirm ${transferType}`}
        description={buildConfirmDescription()}
        confirmLabel={isSubmitting ? 'Processing...' : 'Confirm'}
        loading={isSubmitting}
        onConfirm={confirmTransfer}
      />
    </div>
  );
}
