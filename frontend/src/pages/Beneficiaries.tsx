import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, Users, Star, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Link } from 'react-router-dom';
import { beneficiaryService, Beneficiary } from '@/services/beneficiary';
import { toast } from 'sonner';

export function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Add Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newBen, setNewBen] = useState({
    nickname: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
    favorite: false,
  });

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBeneficiaries = async () => {
    setLoading(true);
    try {
      const data = await beneficiaryService.getBeneficiaries();
      setBeneficiaries(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomersWithDelay();
  }, []);

  const loadCustomersWithDelay = () => {
    loadBeneficiaries();
  };

  const handleToggleFavorite = async (ben: Beneficiary) => {
    try {
      await beneficiaryService.updateBeneficiary(ben.beneficiaryId, {
        favorite: !ben.favorite,
      });
      toast.success(ben.favorite ? 'Removed from favorites' : 'Added to favorites');
      loadBeneficiaries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update favorite status');
    }
  };

  const handleOpenDeleteDialog = (ben: Beneficiary) => {
    setBeneficiaryToDelete(ben);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryToDelete) return;
    setDeleting(true);
    const toastId = toast.loading('Deleting beneficiary...');
    try {
      await beneficiaryService.deleteBeneficiary(beneficiaryToDelete.beneficiaryId);
      toast.success('Beneficiary deleted successfully', { id: toastId });
      setDeleteDialogOpen(false);
      setBeneficiaryToDelete(null);
      loadBeneficiaries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete beneficiary', { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const toastId = toast.loading('Adding beneficiary...');
    try {
      await beneficiaryService.addBeneficiary(newBen);
      toast.success('Beneficiary added successfully', { id: toastId });
      setAddDialogOpen(false);
      setNewBen({
        nickname: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        branch: '',
        favorite: false,
      });
      loadBeneficiaries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add beneficiary', { id: toastId });
    } finally {
      setAdding(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setNewBen((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      b.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.accountNumber.includes(searchTerm)
  );

  const totalSaved = beneficiaries.length;
  const totalFavorites = beneficiaries.filter((b) => b.favorite).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Beneficiaries</h1>
          <p className="text-slate-500">Manage your saved contacts for quick transfers.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Beneficiary
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 shrink-0 mb-2">
        <Card className="bg-white border-slate-200 shadow-sm flex items-center p-4 gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Saved</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalSaved}</h3>
          </div>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm flex items-center p-4 gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Favorites</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalFavorites}</h3>
          </div>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search beneficiaries..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : filteredBeneficiaries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-slate-350 mb-2" />
                <p className="font-semibold text-slate-700">No beneficiaries found</p>
                <p className="text-xs text-slate-400">Add a contact to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nickname / Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Branch</TableHead>
                    <th className="text-right p-4">Actions</th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeneficiaries.map((ben) => (
                    <TableRow key={ben.beneficiaryId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleFavorite(ben)} className="outline-none focus:ring-1 focus:ring-amber-400 rounded">
                            <Star className={`h-4 w-4 cursor-pointer ${ben.favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                          </button>
                          <div>
                            <p className="text-sm text-slate-900 font-semibold">{ben.nickname}</p>
                            <p className="text-xs text-slate-500">{ben.accountName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{ben.bankName}</TableCell>
                      <TableCell className="font-mono text-xs">{ben.accountNumber}</TableCell>
                      <TableCell>{ben.branch}</TableCell>
                      <TableCell className="text-right p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={<Link to={`/customer/transfers?beneficiaryId=${ben.beneficiaryId}`} />}
                          >
                            Send Money
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger nativeButton={true} render={<Button variant="ghost" size="icon" className="h-8 w-8 p-0" />}>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-650 cursor-pointer" onClick={() => handleOpenDeleteDialog(ben)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Beneficiary Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Beneficiary</DialogTitle>
            <DialogDescription>Save contact details for quick fund transfers.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium text-slate-700">Nickname</label>
                <Input id="nickname" value={newBen.nickname} onChange={handleInputChange} required placeholder="e.g. John's Savings" />
              </div>
              <div className="space-y-2">
                <label htmlFor="accountName" className="text-sm font-medium text-slate-700">Account Name</label>
                <Input id="accountName" value={newBen.accountName} onChange={handleInputChange} required placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label htmlFor="accountNumber" className="text-sm font-medium text-slate-700">Account Number</label>
                <Input id="accountNumber" value={newBen.accountNumber} onChange={handleInputChange} required placeholder="e.g. 100120030040" />
              </div>
              <div className="space-y-2">
                <label htmlFor="bankName" className="text-sm font-medium text-slate-700">Bank Name</label>
                <Input id="bankName" value={newBen.bankName} onChange={handleInputChange} required placeholder="e.g. DigitalBank" />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label htmlFor="branch" className="text-sm font-medium text-slate-700">Branch Name</label>
                <Input id="branch" value={newBen.branch} onChange={handleInputChange} required placeholder="e.g. Kollupitiya" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="favorite"
                checked={newBen.favorite}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="favorite" className="text-sm text-slate-700 select-none">Mark as Favorite</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add Beneficiary'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Beneficiary"
        description={`Are you sure you want to delete beneficiary ${beneficiaryToDelete?.nickname} (${beneficiaryToDelete?.accountName})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={async () => handleDeleteSubmit({ preventDefault: () => {} } as React.FormEvent)}
      />
    </div>
  );
}
