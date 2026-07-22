import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Settings, Snowflake } from 'lucide-react';
import { toast } from 'sonner';

export function CardsDashboard() {
  const handleAction = (action: string) => {
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
            <Button variant="outline" size="sm" onClick={() => handleAction('Freeze Card')} className="w-full">
              <Snowflake className="mr-2 h-4 w-4" /> Freeze
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction('Card Settings')} className="w-full">
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
            <Button size="sm" onClick={() => handleAction('Unfreeze Card')} className="w-full">
              <Shield className="mr-2 h-4 w-4" /> Unfreeze
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction('Card Settings')} className="w-full">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
