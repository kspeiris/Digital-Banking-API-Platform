import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileBarChart, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Reports() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500">Generate and download platform performance reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-2">
              <FileBarChart className="h-5 w-5" />
            </div>
            <CardTitle>Daily Transactions Summary</CardTitle>
            <CardDescription>Aggregate volume and count of all transactions processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="today">
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Generate CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-2">
              <FileBarChart className="h-5 w-5" />
            </div>
            <CardTitle>User Growth Report</CardTitle>
            <CardDescription>New account registrations and active user metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="thisMonth">
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Generate PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-2">
              <FileBarChart className="h-5 w-5" />
            </div>
            <CardTitle>Loan Origination Report</CardTitle>
            <CardDescription>Status and volume of new loan applications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="q2">
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q1">Q1 2026</SelectItem>
                <SelectItem value="q2">Q2 2026</SelectItem>
                <SelectItem value="q3">Q3 2026</SelectItem>
                <SelectItem value="q4">Q4 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Generate Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
