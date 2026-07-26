import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { auth } from '@/services/auth';
import { Label } from '@/components/ui/label';

export function Users() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [kycFilter, setKycFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const session = auth.getSession();
  const userRole = session?.user?.role?.toUpperCase() || '';
  const isAdmin = userRole === 'ADMIN';

  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customerToAction, setCustomerToAction] = useState<AdminCustomer | null>(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezing, setFreezing] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', nic: '', dateOfBirth: '' });

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

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      loadCustomers();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleOpenFreezeDialog = (customer: AdminCustomer) => {
    setCustomerToAction(customer);
    setFreezeReason('');
    setFreezeDialogOpen(true);
  };

  const handleOpenUnfreezeDialog = (customer: AdminCustomer) => {
    setCustomerToAction(customer);
    setUnfreezeDialogOpen(true);
  };

  const handleOpenDeleteDialog = (customer: AdminCustomer) => {
    setCustomerToAction(customer);
    setDeleteDialogOpen(true);
  };

  const handleFreezeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToAction) return;
    if (!freezeReason.trim()) {
      toast.error('A reason is required to freeze account');
      return;
    }

    setFreezing(true);
    const toastId = toast.loading('Freezing customer accounts...');
    try {
      await adminService.freezeByUserId(customerToAction.customerId, freezeReason);
      toast.success('Accounts frozen successfully', { id: toastId });
      setFreezeDialogOpen(false);
      setCustomerToAction(null);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to freeze accounts', { id: toastId });
    } finally {
      setFreezing(false);
    }
  };

  const handleUnfreezeSubmit = async () => {
    if (!customerToAction) return;
    setFreezing(true);
    const toastId = toast.loading('Unfreezing customer accounts...');
    try {
      await adminService.unfreezeByUserId(customerToAction.customerId, 'Admin unfreeze');
      toast.success('Accounts unfrozen successfully', { id: toastId });
      setUnfreezeDialogOpen(false);
      setCustomerToAction(null);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unfreeze accounts', { id: toastId });
    } finally {
      setFreezing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!customerToAction) return;
    setFreezing(true);
    const toastId = toast.loading('Deleting customer...');
    try {
      await adminService.deleteCustomer(customerToAction.customerId);
      toast.success('Customer deleted successfully', { id: toastId });
      setDeleteDialogOpen(false);
      setCustomerToAction(null);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer', { id: toastId });
    } finally {
      setFreezing(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFreezing(true);
    try {
      await adminService.createCustomer({
        email: newCustomer.email,
        password: newCustomer.password,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        phone: newCustomer.phone,
        nic: newCustomer.nic,
        dateOfBirth: newCustomer.dateOfBirth,
      });
      toast.success('Customer created successfully');
      setCreateDialogOpen(false);
      setNewCustomer({ email: '', password: '', firstName: '', lastName: '', phone: '', nic: '', dateOfBirth: '' });
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Customer Management</h1>
          <p className="text-sm text-muted-foreground">View, manage, and monitor all bank customers.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        )}
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or NIC..."
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="border border-border rounded-md px-3 py-1.5 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 h-9"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={kycFilter}
                onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
                className="border border-border rounded-md px-3 py-1.5 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="font-semibold text-foreground text-sm">No customers found</p>
                <p className="text-xs text-muted-foreground mt-1">Try modifying your filters or search term.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/80">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KYC Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((user) => (
                    <TableRow key={user.customerId} className="hover:bg-muted/80 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {user.userId && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 select-all">User ID: {user.userId}</p>
                          )}
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
                              <DropdownMenuItem className="text-green-600 font-medium cursor-pointer" onClick={() => handleOpenUnfreezeDialog(user)}>
                                Unfreeze Customer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 font-medium cursor-pointer" onClick={() => handleOpenDeleteDialog(user)}>
                              Delete Customer
                            </DropdownMenuItem>
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
              <div className="text-xs text-muted-foreground">
                Showing { (page - 1) * limit + 1 } to { Math.min(page * limit, total) } of { total } entries
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total}
                  className="h-8 text-xs"
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
              Are you sure you want to freeze all accounts owned by <b>{customerToAction?.name}</b>?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFreezeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium text-foreground">Reason for Suspension</label>
              <textarea
                id="reason"
                rows={3}
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                required
                placeholder="Specify the reason (e.g. suspicious transaction activity)"
                className="w-full border border-border rounded p-2 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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

      {/* Unfreeze Customer Dialog */}
      <ConfirmDialog
        open={unfreezeDialogOpen}
        onOpenChange={setUnfreezeDialogOpen}
        title="Unfreeze Customer Accounts"
        description={`Are you sure you want to unfreeze all accounts owned by <b>${customerToAction?.name}</b>?`}
        confirmLabel="Unfreeze Account"
        loading={freezing}
        onConfirm={handleUnfreezeSubmit}
      />

      {/* Delete Customer Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Customer"
        description={`Are you sure you want to permanently delete <b>${customerToAction?.name}</b>? This will delete all associated accounts, transactions, and data. This action cannot be undone.`}
        confirmLabel="Delete Customer"
        variant="destructive"
        loading={freezing}
        onConfirm={handleDeleteSubmit}
      />

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>Add a new customer to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={newCustomer.firstName} onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={newCustomer.lastName} onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8} value={newCustomer.password} onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <Input id="nic" required value={newCustomer.nic} onChange={(e) => setNewCustomer({ ...newCustomer, nic: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" required value={newCustomer.dateOfBirth} onChange={(e) => setNewCustomer({ ...newCustomer, dateOfBirth: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={freezing}>{freezing ? 'Creating...' : 'Create Customer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
