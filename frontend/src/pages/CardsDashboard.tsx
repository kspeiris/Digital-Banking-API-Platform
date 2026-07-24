import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Settings, Snowflake } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function CardsDashboard() {
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  const [showUnfreezeConfirm, setShowUnfreezeConfirm] = useState(false);
  const [showSettingsConfirm, setShowSettingsConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setActionLoading(false);
    toast.success(`Action "${action}" processed successfully.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Card Management</h1>
        <p className="text-muted-foreground">Manage your debit and credit cards.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-lg tracking-wider">Nexus Platinum</span>
              <CreditCard className="h-6 w-6 opacity-80" />
            </div>
            <div className="font-mono tracking-widest text-lg">**** **** **** 4242</div>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Credit Card</CardTitle>
              <Badge>Active</Badge>
            </div>
            <CardDescription>Exp: 12/28 • Limit: Rs. 10,000</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFreezeConfirm(true)} className="w-full transition-colors">
              <Snowflake className="mr-2 h-4 w-4" /> Freeze
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettingsConfirm(true)} className="w-full transition-colors">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-lg tracking-wider">Nexus Debit</span>
              <CreditCard className="h-6 w-6 opacity-80" />
            </div>
            <div className="font-mono tracking-widest text-lg">**** **** **** 8899</div>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Debit Card</CardTitle>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">Frozen</Badge>
            </div>
            <CardDescription>Exp: 08/29 • Linked: Checking</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => setShowUnfreezeConfirm(true)} className="w-full transition-colors">
              <Shield className="mr-2 h-4 w-4" /> Unfreeze
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettingsConfirm(true)} className="w-full transition-colors">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showFreezeConfirm}
        onOpenChange={setShowFreezeConfirm}
        title="Freeze Card"
        description="This will temporarily block all transactions on your Nexus Debit card. You can unfreeze it anytime."
        confirmLabel="Freeze Card"
        loading={actionLoading}
        onConfirm={() => handleAction('Freeze Card')}
      />
      <ConfirmDialog
        open={showUnfreezeConfirm}
        onOpenChange={setShowUnfreezeConfirm}
        title="Unfreeze Card"
        description="This will restore all transaction capabilities on your Nexus Debit card."
        confirmLabel="Unfreeze Card"
        loading={actionLoading}
        onConfirm={() => handleAction('Unfreeze Card')}
      />
      <ConfirmDialog
        open={showSettingsConfirm}
        onOpenChange={setShowSettingsConfirm}
        title="Card Settings"
        description="You are about to access card settings. This may include PIN changes, limits, and preferences."
        confirmLabel="Continue"
        loading={actionLoading}
        onConfirm={() => handleAction('Card Settings')}
      />
    </div>
  );
}
