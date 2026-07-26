import React, { useEffect, useState } from 'react';
import { Card as CardComponent, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Shield, Settings, Snowflake, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cardService, Card } from '@/services/card';
import { accountService, Account } from '@/services/account';
import { auth } from '@/services/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CardsDashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  const [showUnfreezeConfirm, setShowUnfreezeConfirm] = useState(false);
  const [showSettingsConfirm, setShowSettingsConfirm] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const session = auth.getSession();
  const userRole = session?.user?.role?.toUpperCase() || '';
  const isAdmin = userRole === 'ADMIN';
  const isCustomer = userRole === 'CUSTOMER';

  // Admin: create card states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccountId, setNewAccountId] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardType, setNewCardType] = useState('DEBIT');
  const [newExpiry, setNewExpiry] = useState('');
  const [newPin, setNewPin] = useState('');

  // Customer: request card states
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [customerAccounts, setCustomerAccounts] = useState<Account[]>([]);
  const [requestAccountId, setRequestAccountId] = useState('');
  const [cardRequests, setCardRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Input states
  const [currentPin, setCurrentPin] = useState('');
  const [newPinChange, setNewPinChange] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [atmLimit, setAtmLimit] = useState('');
  const [onlineLimit, setOnlineLimit] = useState('');
  const [contactlessLimit, setContactlessLimit] = useState('');
  const [onlinePayments, setOnlinePayments] = useState(false);
  const [internationalUsage, setInternationalUsage] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await cardService.getCards();
      setCards(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const loadCardRequests = async () => {
    if (!isCustomer) return;
    setLoadingRequests(true);
    try {
      const data = await cardService.getCardRequests();
      setCardRequests(data);
    } catch (err: any) {
      console.error('Failed to load card requests', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isCustomer) {
      loadCardRequests();
    }
  }, [isCustomer]);

  const loadAccounts = async () => {
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
      setCustomerAccounts(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load accounts');
    }
  };

  useEffect(() => {
    if (isAdmin || isCustomer) {
      loadAccounts();
    }
  }, [isAdmin, isCustomer]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await cardService.createCard({
        accountId: newAccountId,
        cardNumber: newCardNumber.replace(/\s/g, ''),
        cardType: newCardType,
        expiry: newExpiry,
        pin: newPin,
      });
      toast.success('Card created successfully');
      setShowCreateDialog(false);
      setNewAccountId('');
      setNewCardNumber('');
      setNewCardType('DEBIT');
      setNewExpiry('');
      setNewPin('');
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await cardService.requestCard(requestAccountId);
      toast.success('Card request submitted! We will review it shortly.');
      setShowRequestDialog(false);
      setRequestAccountId('');
      // Refresh both cards and requests after submission
      await Promise.all([loadCards(), loadCardRequests()]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to request card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setActionLoading(true);
    try {
      await cardService.deleteCard(cardId);
      toast.success('Card deleted successfully');
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action: string, callback: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await callback();
      toast.success(action);
      loadCards();
    } catch (err: any) {
      toast.error(err.message || `Failed to process request`);
    } finally {
      setActionLoading(false);
      setShowFreezeConfirm(false);
      setShowUnfreezeConfirm(false);
      setShowSettingsConfirm(false);
      setShowPinDialog(false);
      setShowLimitsDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>;
      case 'FROZEN':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">Frozen</Badge>;
      case 'BLOCKED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Blocked</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Pending</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-foreground hover:bg-muted border-border">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Card Management</h1>
        <p className="text-muted-foreground">Manage your debit and credit cards.</p>
      </div>

      {isAdmin && (
        <CardComponent className="p-6 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Admin Actions</h3>
              <p className="text-sm text-muted-foreground">Create or manage cards for customers.</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create New Card
            </Button>
          </div>
        </CardComponent>
      )}
      {isCustomer && (
        <CardComponent className="p-6 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Request a Card</h3>
              <p className="text-sm text-muted-foreground">Request a new debit or credit card for your account.</p>
            </div>
            <Button onClick={() => setShowRequestDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Request Card
            </Button>
          </div>
        </CardComponent>
      )}

      {/* Customer Card Requests — shown before the active cards grid */}
      {isCustomer && (
        <CardComponent className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>My Card Requests</CardTitle>
            <CardDescription>Track the status of your card application requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : cardRequests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No card requests yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Use "Request Card" above to apply for a new card.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cardRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';
                  return (
                    <div
                      key={req.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${
                        isPending ? 'border-amber-200 bg-amber-50/50' :
                        isApproved ? 'border-green-200 bg-green-50/50' :
                        'border-red-200 bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ${
                          isPending ? 'bg-amber-400' : isApproved ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isPending ? '⏳' : isApproved ? '✓' : '✕'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {req.cardType?.charAt(0) + (req.cardType?.slice(1)?.toLowerCase() ?? '')} Card
                            {' '}— Account ****{req.account?.accountNumber?.slice(-4)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-1.5">
                        <Badge
                          variant="outline"
                          className={`${
                            isApproved ? 'bg-green-50 text-green-700 border-green-200' :
                            isRejected ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          } text-xs font-semibold`}
                        >
                          {isPending ? '⏱ Under Review' : isApproved ? '✅ Approved' : '❌ Rejected'}
                        </Badge>
                        <p className={`text-xs ${
                          isPending ? 'text-amber-600' :
                          isApproved ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {isPending && 'Your request is being reviewed by the bank.'}
                          {isApproved && 'Your card will be delivered to your registered address soon.'}
                          {isRejected && 'Request was not approved. Contact support for details.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CardComponent>
      )}

      {cards.length === 0 ? (
        <CardComponent className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Cards Found</h3>
          <p className="text-muted-foreground text-sm">You don't have any cards linked to your account yet.</p>
        </CardComponent>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardComponent key={card.cardId} className="overflow-hidden flex flex-col">
              <div className={`h-32 p-6 flex flex-col justify-between text-white ${card.cardType === 'CREDIT' ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'}`}>
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-lg tracking-wider">{card.cardNetwork}</span>
                  <CreditCard className="h-6 w-6 opacity-80" />
                </div>
                <div className="font-mono tracking-widest text-lg">{card.maskedNumber}</div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1).toLowerCase()} Card</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(card.status)}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCard(card.cardId)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>Exp: {card.expiry} • {card.cardNetwork}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 mt-auto">
                {card.status === 'ACTIVE' ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCard(card); setShowFreezeConfirm(true); }} className="w-full transition-colors">
                      <Snowflake className="mr-2 h-4 w-4" /> Freeze Card
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCard(card); setCurrentPin(''); setNewPinChange(''); setShowPinDialog(true); }} className="w-full transition-colors">
                      <Shield className="mr-2 h-4 w-4" /> Change PIN
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedCard(card);
                      setDailyLimit(card.limits?.dailyLimit?.toString() || '500000');
                      setAtmLimit(card.limits?.atmLimit?.toString() || '200000');
                      setOnlineLimit(card.limits?.onlineLimit?.toString() || '200000');
                      setContactlessLimit(card.limits?.contactlessLimit?.toString() || '50000');
                      setShowLimitsDialog(true);
                    }} className="w-full transition-colors">
                      <Settings className="mr-2 h-4 w-4" /> Limits
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedCard(card);
                      setOnlinePayments(card.onlinePayments);
                      setInternationalUsage(card.internationalUsage);
                      setShowSettingsConfirm(true);
                    }} className="w-full transition-colors">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => { setSelectedCard(card); setShowUnfreezeConfirm(true); }} className="w-full col-span-2 transition-colors">
                    <Shield className="mr-2 h-4 w-4" /> Unfreeze Card
                  </Button>
                )}
              </CardContent>
            </CardComponent>
          ))}
        </div>
      )}

      {/* Create Card Dialog - Admin */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>
              Create a new debit or credit card for a customer account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Link to Account</Label>
              <Select value={newAccountId} onValueChange={setNewAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account to link" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => {
                    const typeName = acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase();
                    const last4 = acc.accountNumber.slice(-4);
                    const statusFlag = acc.status.toUpperCase() !== 'ACTIVE' ? ` [⚠ ${acc.status}]` : '';
                    const customerName = acc.customer ? `${acc.customer.firstName} ${acc.customer.lastName} — ` : '';
                    const label = `${customerName}${typeName} (****${last4})${statusFlag}`;
                    return (
                      <SelectItem key={acc.accountId} value={acc.accountId}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">The new card will be linked to this account</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                required
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
                placeholder="1234567890123456"
                maxLength={16}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <Select value={newCardType} onValueChange={setNewCardType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date (MM/YY)</Label>
              <Input
                id="expiry"
                required
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                placeholder="12/28"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPin">PIN</Label>
              <Input
                id="newPin"
                required
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                Create Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Card Dialog - Customer */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Card</DialogTitle>
            <DialogDescription>
              Select an account to link a new card to.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestCard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestAccountId">Link Card to Account</Label>
              <Select value={requestAccountId} onValueChange={setRequestAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {customerAccounts.map((acc) => {
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
              <p className="text-xs text-muted-foreground">The card will be linked to and billed against this account</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <ConfirmDialog
        open={showFreezeConfirm}
        onOpenChange={setShowFreezeConfirm}
        title="Freeze Card"
        description={`This will temporarily block all transactions on your card ending in ${selectedCard?.maskedNumber?.slice(-4)}. You can unfreeze it anytime.`}
        confirmLabel="Freeze Card"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Card frozen successfully', () => cardService.freezeCard(selectedCard.cardId, 'User requested'))}
      />

      {/* Unfreeze Confirmation Dialog */}
      <ConfirmDialog
        open={showUnfreezeConfirm}
        onOpenChange={setShowUnfreezeConfirm}
        title="Unfreeze Card"
        description={`This will restore all transaction capabilities on your card ending in ${selectedCard?.maskedNumber?.slice(-4)}.`}
        confirmLabel="Unfreeze Card"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Card unfrozen successfully', () => cardService.unfreezeCard(selectedCard.cardId))}
      />

      {/* Change PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
            <DialogDescription>
              Update your 4-digit card PIN.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedCard) {
              handleAction('PIN updated successfully', () => cardService.changePin(selectedCard.cardId, currentPin, newPinChange));
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input
                id="currentPin"
                type="password"
                maxLength={4}
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPinChange">New PIN</Label>
              <Input
                id="newPinChange"
                type="password"
                maxLength={4}
                required
                value={newPinChange}
                onChange={(e) => setNewPinChange(e.target.value)}
                placeholder="••••"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPinDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                Change PIN
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Card Limits Dialog */}
      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Card Limits</DialogTitle>
            <DialogDescription>
              Adjust transaction limit preferences for your card.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedCard) {
              handleAction('Limits updated successfully', () => cardService.updateLimits(selectedCard.cardId, {
                dailyLimit: parseFloat(dailyLimit),
                atmLimit: parseFloat(atmLimit),
                onlineLimit: parseFloat(onlineLimit),
                contactlessLimit: parseFloat(contactlessLimit),
              }));
            }
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Transaction Limit (LKR)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  required
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="atmLimit">ATM Withdrawal Limit (LKR)</Label>
                <Input
                  id="atmLimit"
                  type="number"
                  required
                  value={atmLimit}
                  onChange={(e) => setAtmLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onlineLimit">Online Purchase Limit (LKR)</Label>
                <Input
                  id="onlineLimit"
                  type="number"
                  required
                  value={onlineLimit}
                  onChange={(e) => setOnlineLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactlessLimit">Contactless Limit (LKR)</Label>
                <Input
                  id="contactlessLimit"
                  type="number"
                  required
                  value={contactlessLimit}
                  onChange={(e) => setContactlessLimit(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLimitsDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                Update Limits
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Card Settings Dialog */}
      <Dialog open={showSettingsConfirm} onOpenChange={setShowSettingsConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Card Settings</DialogTitle>
            <DialogDescription>
              Toggle online payments and international usage preferences.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedCard) {
              handleAction('Settings updated successfully', () => cardService.updateSettings(selectedCard.cardId, {
                onlinePayments,
                internationalUsage,
              }));
            }
          }} className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="onlinePayments" className="flex flex-col gap-0.5">
                  <span>Online Payments</span>
                  <span className="text-xs text-muted-foreground font-normal">Enable card for online/e-commerce purchases.</span>
                </Label>
                <input
                  id="onlinePayments"
                  type="checkbox"
                  checked={onlinePayments}
                  onChange={(e) => setOnlinePayments(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="internationalUsage" className="flex flex-col gap-0.5">
                  <span>International Usage</span>
                  <span className="text-xs text-muted-foreground font-normal">Enable card for transactions outside the country.</span>
                </Label>
                <input
                  id="internationalUsage"
                  type="checkbox"
                  checked={internationalUsage}
                  onChange={(e) => setInternationalUsage(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSettingsConfirm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
