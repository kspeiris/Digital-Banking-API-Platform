import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, Users, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_BENEFICIARIES = [
  { id: '1', name: 'John Doe', bank: 'Chase Bank', account: '**** 4567', type: 'Domestic', isFavorite: true },
  { id: '2', name: 'Sarah Smith', bank: 'DigitalBank', account: '**** 8912', type: 'Internal', isFavorite: true },
  { id: '3', name: 'Tech Solutions Inc', bank: 'Bank of America', account: '**** 3344', type: 'Domestic', isFavorite: false },
  { id: '4', name: 'Alice Johnson', bank: 'Barclays UK', account: '**** 1122', type: 'International', isFavorite: false },
];

export function Beneficiaries() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Beneficiaries</h1>
          <p className="text-slate-500">Manage your saved contacts for quick transfers.</p>
        </div>
        <Button>
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
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </div>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm flex items-center p-4 gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Favorites</p>
            <h3 className="text-2xl font-bold text-slate-900">2</h3>
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
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Transfer Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_BENEFICIARIES.map((ben) => (
                  <TableRow key={ben.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {ben.isFavorite && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                        {ben.name}
                      </div>
                    </TableCell>
                    <TableCell>{ben.bank}</TableCell>
                    <TableCell className="font-mono">{ben.account}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        ben.type === 'Internal' ? 'bg-blue-50 text-blue-700' :
                        ben.type === 'Domestic' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                      }>
                        {ben.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="outline" size="sm">Send Money</Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
