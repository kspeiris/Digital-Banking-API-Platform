import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowRightLeft, FileText, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Accounts() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Accounts</h1>
        <p className="text-slate-500">View and manage your bank accounts and fixed deposits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Checking Account */}
        <Card className="bg-white border border-slate-200 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Checking Account</CardTitle>
                  <CardDescription>**** 1234</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
              <h3 className="text-3xl font-bold text-slate-900">$7,500.00</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Button variant="outline" size="sm" render={<Link to="/customer/transfers" />}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" /> Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Savings Account */}
        <Card className="bg-white border border-slate-200 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Premium Savings</CardTitle>
                  <CardDescription>**** 5678</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
              <h3 className="text-3xl font-bold text-slate-900">$12,450.80</h3>
              <p className="text-xs text-green-600 mt-1">4.5% APY</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Button variant="outline" size="sm" render={<Link to="/customer/transfers" />}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" /> Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fixed Deposit */}
        <Card className="bg-white border border-slate-200 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Fixed Deposit</CardTitle>
                  <CardDescription>**** 9012</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Maturing</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Principal Amount</p>
              <h3 className="text-3xl font-bold text-slate-900">$25,000.00</h3>
              <p className="text-xs text-slate-500 mt-1">Matures on Dec 15, 2026</p>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-auto">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" /> View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
