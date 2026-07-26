import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cardService } from '@/services/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface CardRequest {
  id: string;
  customerId: string;
  accountId: string;
  cardType: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  account?: {
    accountNumber: string;
    accountType: string;
  };
  customer?: {
    firstName?: string;
    lastName?: string;
    nic?: string;
    user?: {
      email: string;
    };
  };
}

export function AdminCardRequests() {
  const [requests, setRequests] = useState<CardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await cardService.getAllCardRequests(statusFilter === 'all' ? undefined : statusFilter, 1, 50);
      setRequests(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load card requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleApprove = async (requestId: string) => {
    setActionLoading(true);
    try {
      await cardService.approveCardRequest(requestId);
      toast.success('Card request approved and card issued');
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve card request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await cardService.rejectCardRequest(rejectId, rejectReason);
      toast.success('Card request rejected');
      setRejectId(null);
      setRejectReason('');
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject card request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Card Requests</h1>
          <p className="text-sm text-muted-foreground">Review and process customer card requests.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Requests</CardTitle>
          <CardDescription>Customer card requests awaiting review.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground text-sm">No card requests found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Account</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Requested</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/80 transition-colors">
                      <td className="p-3 text-xs">
                        {req.customer ? (
                          <div>
                            <p className="font-semibold text-foreground">{req.customer.firstName} {req.customer.lastName}</p>
                            <p className="text-muted-foreground text-[10px]">{req.customer.user?.email}</p>
                            <p className="text-muted-foreground text-[10px]">{req.customer.nic}</p>
                          </div>
                        ) : 'Unknown'}
                      </td>
                      <td className="p-3 text-xs font-mono">**** {req.account?.accountNumber?.slice(-4)}</td>
                      <td className="p-3 text-xs">{req.cardType}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={
                          req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        {req.status === 'PENDING' && (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(req.id)} disabled={actionLoading} className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50">
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setRejectId(req.id)} disabled={actionLoading} className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
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

      <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Card Request</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this card request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Account not eligible"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
