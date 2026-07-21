import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Car, GraduationCap, DollarSign, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { LoanCalculator } from '@/components/LoanCalculator';

export function Loans() {
  const handleApply = () => {
    toast.info('Loan application workflow initiated.');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Loans</h1>
          <p className="text-slate-500">Manage your active loans and apply for new ones.</p>
        </div>
        <Button onClick={handleApply}>
          <Plus className="mr-2 h-4 w-4" /> Apply for Loan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Loan */}
        <Card className="bg-white border border-slate-200 shadow-sm flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Auto Loan</CardTitle>
                  <CardDescription>Account: **** 3421</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Remaining Balance</p>
                <h3 className="text-2xl font-bold text-slate-900">$18,450.00</h3>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Next Payment (EMI)</p>
                <h3 className="text-2xl font-bold text-slate-900">$450.00</h3>
                <p className="text-xs text-red-500 mt-1">Due in 5 days</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-blue-500 h-full w-[45%]"></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Paid: $15,000</span>
              <span>Total: $33,450</span>
            </div>
            <div className="mt-6">
              <Button className="w-full">Make a Payment</Button>
            </div>
          </CardContent>
        </Card>

        {/* Loan Calculator */}
        <LoanCalculator />
      </div>

      {/* Available Loan Types */}
      <h3 className="text-xl font-bold text-slate-900 mt-4">Other Loan Products</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={handleApply}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Personal Loan</h4>
              <p className="text-xs text-slate-500">Flexible loans for your personal needs. Fast approval process.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={handleApply}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Education Loan</h4>
              <p className="text-xs text-slate-500">Invest in your future with our low-interest education loans.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
