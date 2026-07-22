import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

const transactions = [
  { id: 'TX-987123', date: '2026-07-20', description: 'Amazon.com', type: 'Debit', category: 'Shopping', amount: -124.50, status: 'Completed' },
  { id: 'TX-987124', date: '2026-07-19', description: 'Salary Deposit', type: 'Credit', category: 'Income', amount: 3800.00, status: 'Completed' },
  { id: 'TX-987125', date: '2026-07-19', description: 'Starbucks', type: 'Debit', category: 'Food & Drink', amount: -5.40, status: 'Completed' },
  { id: 'TX-987126', date: '2026-07-18', description: 'Netflix Subscription', type: 'Debit', category: 'Entertainment', amount: -15.99, status: 'Completed' },
  { id: 'TX-987127', date: '2026-07-17', description: 'Internal Transfer to Savings', type: 'Transfer', category: 'Transfer', amount: -500.00, status: 'Completed' },
  { id: 'TX-987128', date: '2026-07-15', description: 'Uber Rides', type: 'Debit', category: 'Transport', amount: -24.50, status: 'Completed' },
  { id: 'TX-987129', date: '2026-07-12', description: 'Whole Foods Market', type: 'Debit', category: 'Groceries', amount: -145.20, status: 'Completed' },
  { id: 'TX-987130', date: '2026-07-10', description: 'ATM Withdrawal', type: 'Debit', category: 'Cash', amount: -100.00, status: 'Completed' },
];

export function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    toast.success('Transactions exported as PDF');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and filter your transaction history.</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="w-fit">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>A list of your recent transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="30">
                <SelectTrigger className="w-[140px]">
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">{tx.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-xs text-muted-foreground">{tx.id}</div>
                      </TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-green-600' : ''}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
