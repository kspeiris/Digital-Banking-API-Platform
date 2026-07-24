import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileBarChart, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/admin';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function Reports() {
  const [txnPeriod, setTxnPeriod] = useState('today');
  const [userPeriod, setUserPeriod] = useState('thisMonth');
  const [loanPeriod, setLoanPeriod] = useState('q2');
  const [generating, setGenerating] = useState(false);
  const [previewReport, setPreviewReport] = useState<{ type: string; format: string; period: string } | null>(null);

  const getDatesFromPeriod = (period: string) => {
    const to = new Date().toISOString();
    let from = new Date();
    
    switch (period) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        from.setDate(from.getDate() - 7);
        break;
      case 'thisMonth':
        from.setDate(1);
        break;
      case 'thisWeek':
        from.setDate(from.getDate() - from.getDay());
        break;
      case 'thisYear':
        from.setMonth(0, 1);
        break;
      case 'q1':
        return { from: '2026-01-01T00:00:00.000Z', to: '2026-03-31T23:59:59.000Z' };
      case 'q2':
        return { from: '2026-04-01T00:00:00.000Z', to: '2026-06-30T23:59:59.000Z' };
      case 'q3':
        return { from: '2026-07-01T00:00:00.000Z', to: '2026-09-30T23:59:59.000Z' };
      case 'q4':
        return { from: '2026-10-01T00:00:00.000Z', to: '2026-12-31T23:59:59.000Z' };
      default:
        break;
    }
    return { from: from.toISOString(), to };
  };

  const handleGenerateReport = async (type: string, format: string, period: string) => {
    setGenerating(true);
    const toastId = toast.loading(`Generating ${type} report...`);
    try {
      const { from, to } = getDatesFromPeriod(period);
      const blob = await adminService.generateReport({
        type,
        format,
        from,
        to
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      link.setAttribute('download', `${type}_report_${period}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success(`${type.toUpperCase()} report generated successfully`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = (type: string, format: string, period: string) => {
    setPreviewReport({ type, format, period });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-500">Generate and download platform performance reports from live data.</p>
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
            <Select value={txnPeriod} onValueChange={setTxnPeriod}>
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
            <Button className="w-full" onClick={() => handleGenerateReport('transactions', 'csv', txnPeriod)}>
              <Download className="mr-2 h-4 w-4" /> Generate CSV
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handlePreview('transactions', 'csv', txnPeriod)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
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
            <Select value={userPeriod} onValueChange={setUserPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => handleGenerateReport('customers', 'pdf', userPeriod)}>
              <Download className="mr-2 h-4 w-4" /> Generate PDF
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handlePreview('customers', 'pdf', userPeriod)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
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
            <Select value={loanPeriod} onValueChange={setLoanPeriod}>
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
            <Button className="w-full" onClick={() => handleGenerateReport('loans', 'csv', loanPeriod)}>
              <Download className="mr-2 h-4 w-4" /> Generate CSV
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handlePreview('loans', 'csv', loanPeriod)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!previewReport}
        onOpenChange={(open) => !open && setPreviewReport(null)}
        title="Report Preview"
        description={
          previewReport
            ? `You are about to preview the ${previewReport.type} report for the selected period in ${previewReport.format.toUpperCase()} format.`
            : undefined
        }
        confirmLabel="Download"
        loading={generating}
        onConfirm={() => previewReport && handleGenerateReport(previewReport.type, previewReport.format, previewReport.period)}
      />
    </div>
  );
}
