import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRightLeft, CalendarClock, Globe } from 'lucide-react';

export function TransferDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Transfer initiated successfully');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

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
        
        <TabsContent value="internal">
          <Card>
            <CardHeader>
              <CardTitle>Internal Transfer</CardTitle>
              <CardDescription>Transfer money between your own Nexus Banking accounts instantly.</CardDescription>
            </CardHeader>
            <form onSubmit={handleTransfer}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking (****1234) - Rs. 7,500.00</SelectItem>
                      <SelectItem value="savings">Savings (****5678) - Rs. 12,450.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Account</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings (****5678)</SelectItem>
                      <SelectItem value="checking">Checking (****1234)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (LKR)</Label>
                  <Input type="number" min="0.01" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input type="text" placeholder="e.g. Rent payment" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="external">
          <Card>
            <CardHeader>
              <CardTitle>External Transfer</CardTitle>
              <CardDescription>Send money to other banks or saved beneficiaries.</CardDescription>
            </CardHeader>
            <form onSubmit={handleTransfer}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking (****1234) - Rs. 7,500.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Beneficiary</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select beneficiary or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b1">John Doe (Commercial Bank)</SelectItem>
                      <SelectItem value="b2">Jane Smith (Sampath Bank)</SelectItem>
                      <SelectItem value="new">+ Add New Beneficiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (LKR)</Label>
                  <Input type="number" min="0.01" step="0.01" placeholder="0.00" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Send Transfer'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Transfer</CardTitle>
              <CardDescription>Set up recurring or future-dated transfers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleTransfer}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select defaultValue="once">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One-time</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Simplified form for demo */}
                <div className="space-y-2">
                  <Label>Amount (LKR)</Label>
                  <Input type="number" min="0.01" step="0.01" placeholder="0.00" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Schedule Transfer
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
