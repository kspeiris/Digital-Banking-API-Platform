import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService, AdminCustomer } from '@/services/admin';
import { toast } from 'sonner';

export function Users() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [kycFilter, setKycFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  // Dialog State
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [customerToFreeze, setCustomerToFreeze] = useState<AdminCustomer | null>(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezing, setFreezing] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.searchCustomers({
        page,
        limit,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        kyc: kycFilter || undefined,
      });
      setCustomers(res.data);
      setTotal(res.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, statusFilter, kycFilter]);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      loadCustomers();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleOpenFreezeDialog = (customer: AdminCustomer) => {
    setCustomerToFreeze(customer);
    setFreezeReason('');
    setFreezeDialogOpen(true);
  };

  const handleFreezeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToFreeze) return;
    if (!freezeReason.trim()) {
      toast.error('A reason is required to freeze account');
      return;
    }

    setFreezing(true);
    const toastId = toast.loading('Freezing customer accounts...');
    try {
      await adminService.freezeCustomer(customerToFreeze.customerId, freezeReason);
      toast.success('Accounts frozen successfully', { id: toastId });
      setFreezeDialogOpen(false);
      setCustomerToFreeze(null);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to freeze accounts', { id: toastId });
    } finally {
      setFreezing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'SUSPENDED':
      case 'FROZEN':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Frozen</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-slate-500">View, manage, and monitor all bank customers.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or NIC..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="border border-slate-200 rounded px-3 py-1.5 text-sm bg-white outline-none"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={kycFilter}
                onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
                className="border border-slate-200 rounded px-3 py-1.5 text-sm bg-white outline-none"
              >
                <option value="">All KYC Status</option>
                <option value="Verified">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
                <p className="font-semibold text-slate-700">No customers found</p>
                <p className="text-xs text-slate-400">Try modifying your filters or search term.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((user) => (
                    <TableRow key={user.customerId}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.kycStatus === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700'}>
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.status === 'ACTIVE' ? (
                              <DropdownMenuItem className="text-red-600 font-medium cursor-pointer" onClick={() => handleOpenFreezeDialog(user)}>
                                Freeze Customer
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-slate-400 disabled">
                                Account is Frozen
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {!loading && customers.length > 0 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-slate-500">
                Showing { (page - 1) * limit + 1 } to { Math.min(page * limit, total) } of { total } entries
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Freeze Customer Dialog */}
      <Dialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Freeze Customer Accounts</DialogTitle>
            <DialogDescription>
              Are you sure you want to freeze all accounts owned by <b>{customerToFreeze?.name}</b>?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFreezeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium text-slate-700">Reason for Suspension</label>
              <textarea
                id="reason"
                rows={3}
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                required
                placeholder="Specify the reason (e.g. suspicious transaction activity)"
                className="w-full border border-slate-200 rounded p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFreezeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={freezing} className="bg-red-600 hover:bg-red-700 text-white">
                {freezing ? 'Freezing...' : 'Freeze Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
