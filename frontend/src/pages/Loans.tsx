import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Car, GraduationCap, DollarSign, Plus, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoanCalculator } from '@/components/LoanCalculator';
import { loanService, Loan } from '@/services/loan';
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

export function Loans() {
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const session = auth.getSession();
  const userRole = session?.user?.role?.toUpperCase() || '';
  const isCustomer = userRole === 'CUSTOMER';

  // Customer: cancel state
  const [cancellingLoan, setCancellingLoan] = useState<Loan | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Form states
  const [loanType, setLoanType] = useState('PERSONAL');
  const [requestedAmount, setRequestedAmount] = useState('100000');
  const [durationMonths, setDurationMonths] = useState('36');
  const [monthlyIncome, setMonthlyIncome] = useState('50000');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [purpose, setPurpose] = useState('Home Renovation');

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

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      await loanService.applyForLoan({
        loanType,
        requestedAmount: parseFloat(requestedAmount),
        durationMonths: parseInt(durationMonths),
        monthlyIncome: parseFloat(monthlyIncome),
        employmentType,
        purpose,
      });
      toast.success('Application submitted successfully');
      setShowApplyDialog(false);
      loadLoans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit loan application');
    } finally {
      setApplying(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingLoan) return;
    setCancelLoading(true);
    try {
      await loanService.cancelLoan(cancellingLoan.loanId);
      toast.success('Loan application cancelled');
      setShowCancelConfirm(false);
      setCancellingLoan(null);
      loadLoans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel loan application');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Rejected</Badge>;
      case 'SUBMITTED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200">Under Review</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-muted text-foreground hover:bg-muted border-border">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-foreground hover:bg-muted border-border">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return 'Rs. 0.00';
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Manage your active loans and apply for new ones.</p>
        </div>
        <Button onClick={() => setShowApplyDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Apply for Loan
        </Button>
      </div>

      {loans.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Loans Found</h3>
          <p className="text-muted-foreground text-sm">You don't have any active loans. Apply for one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {loans.map((loan) => (
            <Card key={loan.loanId} className="bg-background border border-border shadow-sm flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                       {loan.loanType === 'HOME' ? <Home className="w-5 h-5" /> : loan.loanType === 'VEHICLE' ? <Car className="w-5 h-5" /> : loan.loanType === 'EDUCATION' ? <GraduationCap className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1).toLowerCase()} Loan</CardTitle>
                      <CardDescription>Applied on {loan.submittedAt}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Requested Amount</p>
                    <h3 className="text-2xl font-bold text-foreground">{formatCurrency(loan.requestedAmount)}</h3>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Monthly EMI</p>
                    <h3 className="text-2xl font-bold text-foreground">{formatCurrency(loan.emi)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{loan.durationMonths} months • {loan.interestRate}% APR</p>
                  </div>
                </div>
                {loan.approvedAmount > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-2">
                      <div className="bg-green-500 h-full w-full transition-all duration-500"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Approved: {formatCurrency(loan.approvedAmount)}</span>
                      <span>Fully Approved</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {isCustomer && (loan.status === 'SUBMITTED' || loan.status === 'UNDER_REVIEW') && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => { setCancellingLoan(loan); setShowCancelConfirm(true); }}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancel Application
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Cancel Loan Confirmation */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancel Loan Application"
        description={`Are you sure you want to cancel your loan application? This action cannot be undone.`}
        confirmLabel="Cancel Application"
        loading={cancelLoading}
        onConfirm={handleCancel}
      />

      {/* Available Loan Types */}
      <h3 className="text-xl font-bold text-foreground mt-4">Other Loan Products</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-background border border-border hover:border-primary transition-colors cursor-pointer" onClick={() => { setLoanType('PERSONAL'); setShowApplyDialog(true); }}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Personal Loan</h4>
              <p className="text-xs text-muted-foreground">Flexible loans for your personal needs. Fast approval process.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border border-border hover:border-primary transition-colors cursor-pointer" onClick={() => { setLoanType('EDUCATION'); setShowApplyDialog(true); }}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Education Loan</h4>
              <p className="text-xs text-muted-foreground">Invest in your future with our low-interest education loans.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border border-border hover:border-primary transition-colors cursor-pointer" onClick={() => { setLoanType('HOME'); setShowApplyDialog(true); }}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Home Loan</h4>
              <p className="text-xs text-muted-foreground">Make your dream home a reality with our competitive rates.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for Loan</DialogTitle>
            <DialogDescription>
              Complete the form below to submit a new loan application.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loanType">Loan Type</Label>
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger id="loanType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                    <SelectItem value="HOME">Home Loan</SelectItem>
                    <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                    <SelectItem value="EDUCATION">Education Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Requested Amount (LKR)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="10000"
                  max="50000000"
                  required
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="e.g. 500,000"
                />
                <p className="text-xs text-muted-foreground">Minimum LKR 10,000 &mdash; Maximum LKR 50,000,000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMonths">Repayment Period</Label>
                <Input
                  id="durationMonths"
                  name="durationMonths"
                  type="number"
                  min="6"
                  max="360"
                  required
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  placeholder="e.g. 24"
                />
                <p className="text-xs text-muted-foreground">Number of months &mdash; 6 to 360</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Net Income (LKR)</Label>
                <Input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="number"
                  min="0"
                  required
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 75,000"
                />
                <p className="text-xs text-muted-foreground">Your take-home income after tax, per month</p>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="employmentType">Employment Status</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger id="employmentType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-Time Employed</SelectItem>
                    <SelectItem value="PART_TIME">Part-Time Employed</SelectItem>
                    <SelectItem value="SELF_EMPLOYED">Self-Employed / Business Owner</SelectItem>
                    <SelectItem value="UNEMPLOYED">Currently Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="purpose">Purpose of Loan</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Business expansion"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
