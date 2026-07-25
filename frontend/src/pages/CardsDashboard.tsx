import React, { useEffect, useState } from 'react';
import { Card as CardComponent, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Settings, Snowflake, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cardService, Card } from '@/services/card';

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

  const handleAction = async (action: string, callback: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await callback();
      toast.success(`Action "${action}" processed successfully.`);
      loadCards();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action.toLowerCase()}`);
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
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-50 border-slate-200">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading your cards...</p>
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

      {cards.length === 0 ? (
        <CardComponent className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Cards Found</h3>
          <p className="text-slate-500 text-sm">You don't have any cards linked to your account yet.</p>
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
                  {getStatusBadge(card.status)}
                </div>
                <CardDescription>Exp: {card.expiry} • {card.cardNetwork}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 mt-auto">
                {card.status === 'ACTIVE' ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCard(card); setShowFreezeConfirm(true); }} className="w-full transition-colors">
                      <Snowflake className="mr-2 h-4 w-4" /> Freeze
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCard(card); setShowPinDialog(true); }} className="w-full transition-colors">
                      <Shield className="mr-2 h-4 w-4" /> Change PIN
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCard(card); setShowLimitsDialog(true); }} className="w-full transition-colors">
                      <Settings className="mr-2 h-4 w-4" /> Limits
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCard(card); setShowSettingsConfirm(true); }} className="w-full transition-colors">
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

      <ConfirmDialog
        open={showFreezeConfirm}
        onOpenChange={setShowFreezeConfirm}
        title="Freeze Card"
        description={`This will temporarily block all transactions on your card ending in ${selectedCard?.maskedNumber?.slice(-4)}. You can unfreeze it anytime.`}
        confirmLabel="Freeze Card"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Freeze Card', () => cardService.freezeCard(selectedCard.cardId, 'User requested'))}
      />
      <ConfirmDialog
        open={showUnfreezeConfirm}
        onOpenChange={setShowUnfreezeConfirm}
        title="Unfreeze Card"
        description={`This will restore all transaction capabilities on your card ending in ${selectedCard?.maskedNumber?.slice(-4)}.`}
        confirmLabel="Unfreeze Card"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Unfreeze Card', () => cardService.unfreezeCard(selectedCard.cardId))}
      />
      <ConfirmDialog
        open={showSettingsConfirm}
        onOpenChange={setShowSettingsConfirm}
        title="Card Settings"
        description="You are about to update card settings. This may include online payments and international usage preferences."
        confirmLabel="Update Settings"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Update Settings', () => cardService.updateSettings(selectedCard.cardId, { onlinePayments: !selectedCard.onlinePayments, internationalUsage: !selectedCard.internationalUsage }))}
      />
      <ConfirmDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        title="Change PIN"
        description="You will need to enter your current PIN and set a new 4-digit PIN."
        confirmLabel="Change PIN"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Change PIN', () => cardService.changePin(selectedCard.cardId, '1234', '5678'))}
      />
      <ConfirmDialog
        open={showLimitsDialog}
        onOpenChange={setShowLimitsDialog}
        title="Update Card Limits"
        description="You are about to update spending limits for this card."
        confirmLabel="Update Limits"
        loading={actionLoading}
        onConfirm={() => selectedCard && handleAction('Update Limits', () => cardService.updateLimits(selectedCard.cardId, { dailyLimit: 500000, atmLimit: 200000, onlineLimit: 200000, contactlessLimit: 50000 }))}
      />
    </div>
  );
}
