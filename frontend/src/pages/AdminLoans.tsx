import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Car, GraduationCap, DollarSign, Plus, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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

export function AdminLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('SUBMITTED');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvingLoan, setApprovingLoan] = useState<Loan | null>(null);
  const [rejectingLoan, setRejectingLoan] = useState<Loan | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingLoan) return;
    setActionLoading(true);
    try {
      await loanService.approveLoan(approvingLoan.loanId, parseFloat(approvedAmount), parseFloat(interestRate));
      toast.success('Loan approved successfully');
      setShowApproveDialog(false);
      setApprovingLoan(null);
      loadLoans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingLoan) return;
    setActionLoading(true);
    try {
      await loanService.rejectLoan(rejectingLoan.loanId, rejectReason);
      toast.success('Loan rejected successfully');
      setShowRejectDialog(false);
      setRejectingLoan(null);
      loadLoans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject loan');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => statusFilter === 'all' || loan.status === statusFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Loan Review</h1>
          <p className="text-sm text-muted-foreground">Review and process loan applications.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Loan Applications</CardTitle>
              <CardDescription>Review and approve or reject loan requests.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground text-sm">No loans found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Loan Type</th>
                    <th className="p-3 font-medium">Requested</th>
                    <th className="p-3 font-medium">Duration</th>
                    <th className="p-3 font-medium">Rate</th>
                    <th className="p-3 font-medium">Details</th>
                    <th className="p-3 font-medium">Submitted</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-muted/80 transition-colors">
                      <td className="p-3 text-xs">
                        {loan.customer ? (
                          <div>
                            <p className="font-semibold text-foreground">{loan.customer.firstName} {loan.customer.lastName}</p>
                            <p className="text-muted-foreground text-[10px]">{loan.customer.nic}</p>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                            {loan.loanType === 'HOME' ? <Home className="w-4 h-4" /> : loan.loanType === 'VEHICLE' ? <Car className="w-4 h-4" /> : loan.loanType === 'EDUCATION' ? <GraduationCap className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                          </div>
                          <span className="font-medium text-xs">{loan.loanType}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-semibold text-foreground">{loan.requestedAmount ? loan.requestedAmount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' }) : '-'}</td>
                      <td className="p-3 text-xs">{loan.durationMonths ? `${loan.durationMonths} months` : '-'}</td>
                      <td className="p-3 text-xs">{loan.interestRate !== undefined ? `${loan.interestRate}%` : '-'}</td>
                      <td className="p-3 text-xs max-w-[200px] truncate">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">{loan.employmentType || 'N/A'}</p>
                          <p className="text-muted-foreground truncate" title={loan.purpose}>{loan.purpose || 'No purpose stated'}</p>
                          {loan.monthlyIncome && (
                            <p className="text-[10px] text-muted-foreground">Income: LKR {loan.monthlyIncome.toLocaleString('en-LK')}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{loan.submittedAt || '-'}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={
                          loan.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          loan.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {(loan.status === 'SUBMITTED' || loan.status === 'UNDER_REVIEW') && (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setApprovingLoan(loan); setApprovedAmount(loan.requestedAmount.toString()); setInterestRate(loan.interestRate.toString()); setShowApproveDialog(true); }}
                              className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setRejectingLoan(loan); setRejectReason(''); setShowRejectDialog(true); }}
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Loan</DialogTitle>
            <DialogDescription>Enter the approved amount and interest rate for this loan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApprove} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approvedAmount">Approved Amount (LKR)</Label>
              <Input id="approvedAmount" type="number" required value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input id="interestRate" type="number" step="0.01" required value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={actionLoading}>Approve Loan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Loan</DialogTitle>
            <DialogDescription>Optionally provide a reason for rejecting this loan application.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason (optional)</Label>
              <Input id="rejectReason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Insufficient income" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={actionLoading}>Reject Loan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
