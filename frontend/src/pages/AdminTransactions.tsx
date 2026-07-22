import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_TRANSACTIONS = [
  { id: 'TRX-9821', customer: 'Alexander Pierce', amount: 15420.00, type: 'Wire Transfer', status: 'pending', date: '2026-07-21 14:30', riskScore: 'high' },
  { id: 'TRX-9820', customer: 'Maria Garcia', amount: -250.00, type: 'Card Payment', status: 'completed', date: '2026-07-21 12:15', riskScore: 'low' },
  { id: 'TRX-9819', customer: 'James Smith', amount: -15.99, type: 'Subscription', status: 'completed', date: '2026-07-21 09:45', riskScore: 'low' },
  { id: 'TRX-9818', customer: 'Emily Chen', amount: 3500.00, type: 'Deposit', status: 'completed', date: '2026-07-20 16:20', riskScore: 'low' },
  { id: 'TRX-9817', customer: 'Robert Johnson', amount: -8500.00, type: 'Transfer', status: 'flagged', date: '2026-07-20 11:10', riskScore: 'critical' },
];

export function AdminTransactions() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction Monitoring</h1>
          <p className="text-slate-500">Monitor all platform transactions and review flagged activities.</p>
        </div>
        <Button variant="outline">
          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> Review Flagged (1)
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ID, customer, or amount..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <Button className="w-full sm:w-auto">
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type & Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TRANSACTIONS.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs">{trx.id}</TableCell>
                    <TableCell className="font-medium">{trx.customer}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{trx.type}</p>
                        <p className="text-xs text-slate-500">{trx.date}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {trx.amount > 0 ? (
                        <span className="text-green-600">+{trx.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</span>
                      ) : (
                        <span>{trx.amount.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          trx.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                          trx.status === 'flagged' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {trx.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                        {trx.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                        {trx.status === 'flagged' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {trx.status.charAt(0).toUpperCase() + trx.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge 
                        variant="secondary" 
                        className={
                          trx.riskScore === 'low' ? 'bg-slate-100 text-slate-700' : 
                          trx.riskScore === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }
                      >
                        {trx.riskScore.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Review</Button>
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
