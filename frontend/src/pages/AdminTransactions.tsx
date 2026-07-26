import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { adminService } from '@/services/admin';

interface AdminTransaction {
  id: string;
  transactionReference: string;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  createdAt: string;
  fromAccount?: {
    accountNumber: string;
    customer?: {
      user?: {
        email: string;
      };
    };
  };
  toAccount?: {
    accountNumber: string;
    customer?: {
      user?: {
        email: string;
      };
    };
  };
  beneficiary?: {
    accountName: string;
  };
}

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getTransactions({
        page: 1,
        limit: 50,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      setTransactions(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const getCustomerEmail = (tx: AdminTransaction): string => {
    return tx.fromAccount?.customer?.user?.email || tx.toAccount?.customer?.user?.email || 'Unknown';
  };

  const getReceiver = (tx: AdminTransaction): string => {
    if (tx.beneficiary?.accountName) return tx.beneficiary.accountName;
    if (tx.toAccount?.accountNumber) return tx.toAccount.accountNumber;
    return 'N/A';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Transaction Monitoring</h1>
          <p className="text-muted-foreground">Monitor all platform transactions and review flagged activities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStatusFilter(statusFilter === 'FAILED' ? 'all' : 'FAILED')} disabled={loading}>
            <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> {statusFilter === 'FAILED' ? 'Show All' : 'Review Flagged'}
          </Button>
        </div>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, customer, or amount..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" /> {statusFilter || 'Filters'}
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="SUCCESS">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type & Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.transactionReference}</TableCell>
                        <TableCell className="font-medium">{getCustomerEmail(tx)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{tx.transactionType}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {tx.amount > 0 ? (
                            <span className="text-green-600">+{Number(tx.amount).toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</span>
                          ) : (
                            <span>{Number(tx.amount).toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                              tx.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          >
                            {tx.status === 'SUCCESS' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {tx.status === 'PENDING' && <Clock className="mr-1 h-3 w-3" />}
                            {tx.status === 'FAILED' && <AlertTriangle className="mr-1 h-3 w-3" />}
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{getReceiver(tx)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Review</Button>
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
    </div>
  );
}
