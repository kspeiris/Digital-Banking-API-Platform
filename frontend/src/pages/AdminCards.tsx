import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cardService, Card as CardType } from '@/services/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accountService, Account } from '@/services/account';

export function AdminCards() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newCard, setNewCard] = useState({ accountId: '', cardNumber: '', cardType: 'DEBIT', expiry: '', pin: '' });
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (showCreateDialog && accounts.length === 0) {
      accountService.getAccounts().then(setAccounts).catch(() => {});
    }
  }, [showCreateDialog]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await cardService.createCard({
        accountId: newCard.accountId,
        cardNumber: newCard.cardNumber,
        cardType: newCard.cardType,
        expiry: newCard.expiry,
        pin: newCard.pin,
      });
      toast.success('Card created successfully');
      setShowCreateDialog(false);
      setNewCard({ accountId: '', cardNumber: '', cardType: 'DEBIT', expiry: '', pin: '' });
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create card');
    } finally {
      setCreating(false);
    }
  };

  const handleFreeze = async (cardId: string) => {
    setActionLoadingId(cardId);
    try {
      await cardService.freezeCard(cardId);
      toast.success('Card frozen successfully');
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to freeze card');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnfreeze = async (cardId: string) => {
    setActionLoadingId(cardId);
    try {
      await cardService.unfreezeCard(cardId);
      toast.success('Card unfrozen successfully');
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unfreeze card');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!window.confirm('Are you sure you want to delete and revoke this card?')) return;
    setActionLoadingId(cardId);
    try {
      await cardService.deleteCard(cardId);
      toast.success('Card deleted successfully');
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete card');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Card Management</h1>
          <p className="text-sm text-muted-foreground">Create, view, and manage all platform cards.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Card
        </Button>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">All Cards</CardTitle>
          <CardDescription>Complete card inventory across all customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground text-sm">No cards found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Card Number</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Account</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Expiry</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {cards.map((card) => {
                    const cardId = card.id || card.cardId;
                    return (
                      <tr key={cardId} className="hover:bg-muted/80 transition-colors">
                        <td className="p-3 text-xs">
                          {card.account?.customer ? (
                            <div>
                              <p className="font-semibold text-foreground">{card.account.customer.firstName} {card.account.customer.lastName}</p>
                              <p className="text-muted-foreground text-[10px]">{card.account.customer.nic}</p>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-3 font-mono text-xs">**** **** **** {(card.cardNumber || card.maskedNumber || '').slice(-4)}</td>
                        <td className="p-3 text-xs">{card.cardType}</td>
                        <td className="p-3 text-xs font-mono">**** {card.account?.accountNumber?.slice(-4) || ''}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={
                            card.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                            card.status === 'FROZEN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }>
                            {card.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs">{card.expiry}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {card.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoadingId === cardId}
                                onClick={() => handleFreeze(cardId)}
                                className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              >
                                Freeze
                              </Button>
                            ) : card.status === 'FROZEN' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoadingId === cardId}
                                onClick={() => handleUnfreeze(cardId)}
                                className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                Unfreeze
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={actionLoadingId === cardId}
                              onClick={() => handleDelete(cardId)}
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>Issue a new card for an existing account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Link to Account</Label>
              <Select value={newCard.accountId} onValueChange={(v) => setNewCard({ ...newCard, accountId: v })}>
                <SelectTrigger><SelectValue placeholder="Select account to link" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => {
                    const typeName = acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase();
                    const last4 = acc.accountNumber.slice(-4);
                    const statusFlag = acc.status.toUpperCase() !== 'ACTIVE' ? ` [⚠ ${acc.status}]` : '';
                    const customerName = acc.account?.customer
                      ? `${acc.account.customer.firstName} ${acc.account.customer.lastName} — `
                      : '';
                    const label = `${customerName}${typeName} (****${last4})${statusFlag}`;
                    return (
                      <SelectItem key={acc.accountId} value={acc.accountId}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">The card will be linked to this bank account</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number <span className="font-normal text-muted-foreground text-xs">(16 digits, no spaces)</span></Label>
              <Input
                id="cardNumber"
                required
                value={newCard.cardNumber}
                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
              <p className="text-xs text-muted-foreground text-right">{newCard.cardNumber.length}/16 digits</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardType">Type</Label>
                <Select value={newCard.cardType} onValueChange={(v) => setNewCard({ ...newCard, cardType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                <Input id="expiry" required value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })} placeholder="12/28" maxLength={5} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Card PIN <span className="font-normal text-muted-foreground text-xs">(4 digits)</span></Label>
              <Input
                id="pin"
                type="password"
                required
                value={newCard.pin}
                onChange={(e) => setNewCard({ ...newCard, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">Exactly 4 digits. The customer will be prompted to change this on first use.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Card'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
