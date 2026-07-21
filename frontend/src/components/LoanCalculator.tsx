import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

export function LoanCalculator() {
  const [principal, setPrincipal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(5.5);
  const [years, setYears] = useState<number>(5);

  const calculateEMI = () => {
    if (!principal || !rate || !years) return 0;
    const p = principal;
    const r = rate / 12 / 100;
    const n = years * 12;
    if (r === 0) return p / n;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalPayment = emi * years * 12;
  const totalInterest = totalPayment - principal;

  return (
    <Card className="bg-white border-slate-200 shadow-sm w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Loan Calculator
        </CardTitle>
        <CardDescription>Estimate your monthly loan payments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Loan Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Interest Rate (% APY)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              min="0"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Loan Term (Years)</Label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              min="1"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 font-medium">Monthly Payment</span>
            <span className="text-xl font-bold text-blue-600">
              ${emi ? emi.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Total Interest</span>
            <span className="font-medium text-slate-900">
              ${totalInterest > 0 ? totalInterest.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Total Payment</span>
            <span className="font-medium text-slate-900">
              ${totalPayment > 0 ? totalPayment.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
