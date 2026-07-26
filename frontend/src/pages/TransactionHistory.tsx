import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Loader2, Filter, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService, TransactionItem, TransactionHistoryResponse } from '@/services/transaction';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { auth } from '@/services/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const PAGE_SIZE = 25;

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const session = auth.getSession();
  const userRole = session?.user?.role?.toUpperCase() || '';
  const isAdmin = userRole === 'ADMIN';

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: PAGE_SIZE };
      if (typeFilter !== 'all') params.type = typeFilter.toUpperCase();

      const now = new Date();
      const fromDate = new Date();
      if (dateFilter === '7') fromDate.setDate(now.getDate() - 7);
      else if (dateFilter === '30') fromDate.setDate(now.getDate() - 30);
      else if (dateFilter === '90') fromDate.setDate(now.getDate() - 90);
      params.from = fromDate.toISOString().split('T')[0];
      params.to = now.toISOString().split('T')[0];

      const res: TransactionHistoryResponse = await transactionService.getHistory(params);
      setTransactions(res.data);
      setTotalCount(res.pagination?.total ?? res.data.length);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, dateFilter, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 when filters change
  const handleTypeFilter = (val: string) => {
    setTypeFilter(val);
    setPage(1);
  };
  const handleDateFilter = (val: string) => {
    setDateFilter(val);
    setPage(1);
  };

  const filteredTransactions = transactions.filter(tx =>
    (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = async () => {
    if (!cancelId) return;
    setActionLoading(true);
    try {
      await transactionService.cancelTransaction(cancelId);
      toast.success('Transaction cancelled successfully');
      setCancelId(null);
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeId || !disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    setActionLoading(true);
    try {
      await transactionService.disputeTransaction(disputeId, disputeReason);
      toast.success('Dispute submitted successfully');
      setDisputeId(null);
      setDisputeReason('');
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Reference', 'Date', 'Description', 'Type', 'Amount', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.reference,
      tx.date,
      tx.description,
      tx.type,
      tx.amount.toString(),
      tx.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported as CSV');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">View and filter your transaction history.</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="w-fit" disabled={loading || filteredTransactions.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">History</CardTitle>
              <CardDescription>
                {totalCount > 0
                  ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount} transactions`
                  : 'A list of your recent transactions.'}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8 h-9 text-sm w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={handleTypeFilter}>
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={handleDateFilter}>
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/80">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.reference} className="hover:bg-muted/80 transition-colors">
                        <TableCell className="whitespace-nowrap text-xs">{tx.date}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{tx.description}</div>
                          <div className="text-xs text-muted-foreground">{tx.reference}</div>
                        </TableCell>
                        <TableCell className="text-xs">{tx.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' :
                            tx.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium text-sm ${tx.amount > 0 ? 'text-green-600' : ''}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {tx.status === 'PENDING' && (
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setCancelId(tx.reference)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                              </Button>
                            )}
                            {tx.status === 'SUCCESS' && !isAdmin && (
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setDisputeId(tx.reference)}>
                                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Dispute
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!loading && totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} • {totalCount} total transactions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9 h-9 p-0 text-xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages || loading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel Transaction"
        description="Are you sure you want to cancel this transaction? This action cannot be undone."
        confirmLabel="Cancel Transaction"
        variant="destructive"
        loading={actionLoading}
        onConfirm={handleCancel}
      />

      {/* Dispute Confirmation */}
      <Dialog open={!!disputeId} onOpenChange={(open) => { if (!open) { setDisputeId(null); setDisputeReason(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispute Transaction</DialogTitle>
            <DialogDescription>Provide a reason for disputing this transaction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Dispute</Label>
              <textarea
                id="reason"
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                required
                placeholder="Describe the issue with this transaction..."
                className="w-full border border-border rounded p-2 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDisputeId(null); setDisputeReason(''); }}>Cancel</Button>
              <Button onClick={handleDispute} disabled={actionLoading || !disputeReason.trim()}>{actionLoading ? 'Submitting...' : 'Submit Dispute'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
