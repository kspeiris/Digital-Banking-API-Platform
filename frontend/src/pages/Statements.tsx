import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Mail } from 'lucide-react';

const MOCK_STATEMENTS = [
  { id: '1', month: 'June 2026', type: 'Checking Account', date: 'Jul 1, 2026', size: '245 KB' },
  { id: '2', month: 'May 2026', type: 'Checking Account', date: 'Jun 1, 2026', size: '210 KB' },
  { id: '3', month: 'April 2026', type: 'Checking Account', date: 'May 1, 2026', size: '280 KB' },
  { id: '4', month: 'Q2 2026', type: 'Credit Card', date: 'Jul 5, 2026', size: '1.2 MB' },
];

export function Statements() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Statements & Documents</h1>
          <p className="text-slate-500">Download your monthly account statements and tax documents.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full sm:w-auto">
              <Select defaultValue="checking">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="savings">Premium Savings</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="2026">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> Custom Range
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {MOCK_STATEMENTS.map((stmt) => (
              <div key={stmt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{stmt.month} Statement</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="font-normal">{stmt.type}</Badge>
                      <span className="text-xs text-slate-500">Generated: {stmt.date} • {stmt.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
        <FileText className="w-6 h-6 text-blue-600 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-900 text-lg">Looking for Tax Documents?</h3>
          <p className="text-blue-700 mt-1 mb-4">
            Your 1099-INT and other end-of-year tax documents are available in the Tax Center starting January 31st each year.
          </p>
          <Button variant="outline" className="bg-white hover:bg-slate-50">Go to Tax Center</Button>
        </div>
      </div>
    </div>
  );
}
