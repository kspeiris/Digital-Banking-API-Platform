import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Car, GraduationCap, DollarSign, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoanCalculator } from '@/components/LoanCalculator';
import { loanService, Loan } from '@/services/loan';

export function Loans() {
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const data = await loanService.getLoans();
      setLoans(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleApply = async () => {
    setApplying(true);
    try {
      await loanService.applyForLoan({
        loanType: 'PERSONAL',
        requestedAmount: 100000,
        durationMonths: 36,
        monthlyIncome: 50000,
        employmentType: 'FULL_TIME',
        purpose: 'Home Renovation',
      });
      toast.success('Loan application submitted successfully');
      setShowApplyDialog(false);
      loadLoans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit loan application');
    } finally {
      setApplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Rejected</Badge>;
      case 'SUBMITTED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Under Review</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-50 border-slate-200">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Loans</h1>
          <p className="text-slate-500">Manage your active loans and apply for new ones.</p>
        </div>
        <Button onClick={() => setShowApplyDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Apply for Loan
        </Button>
      </div>

      {loans.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Loans Found</h3>
          <p className="text-slate-500 text-sm">You don't have any active loans. Apply for one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {loans.map((loan) => (
            <Card key={loan.loanId} className="bg-white border border-slate-200 shadow-sm flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      {loan.loanType === 'HOME' ? <Home className="w-5 h-5" /> : loan.loanType === 'VEHICLE' ? <Car className="w-5 h-5" /> : loan.loanType === 'EDUCATION' ? <GraduationCap className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1).toLowerCase()} Loan</CardTitle>
                      <CardDescription>Applied on {loan.submittedAt}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Requested Amount</p>
                    <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(loan.requestedAmount)}</h3>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Monthly EMI</p>
                    <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(loan.emi)}</h3>
                    <p className="text-xs text-slate-500 mt-1">{loan.durationMonths} months • {loan.interestRate}% APR</p>
                  </div>
                </div>
                {loan.approvedAmount > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                      <div className="bg-green-500 h-full w-full transition-all duration-500"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Approved: {formatCurrency(loan.approvedAmount)}</span>
                      <span>Fully Approved</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Loan Types */}
      <h3 className="text-xl font-bold text-slate-900 mt-4">Other Loan Products</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setShowApplyDialog(true)}>
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
        <Card className="bg-white border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setShowApplyDialog(true)}>
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
        <Card className="bg-white border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setShowApplyDialog(true)}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Home Loan</h4>
              <p className="text-xs text-slate-500">Make your dream home a reality with our competitive rates.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        title="Apply for Loan"
        description="You are about to start a new loan application. Please ensure you have all required documents ready."
        confirmLabel={applying ? 'Submitting...' : 'Start Application'}
        loading={applying}
        onConfirm={handleApply}
      />
    </div>
  );
}
