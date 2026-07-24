import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertTriangle, Search, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

const MOCK_ALERTS = [
  { id: 'ALT-9921', user: 'Alice Smith', type: 'Unusual Login Location', risk: 'High', status: 'Pending', time: '10 mins ago' },
  { id: 'ALT-9920', user: 'Bob Jones', type: 'Multiple Failed Transfers', risk: 'Medium', status: 'Pending', time: '1 hour ago' },
  { id: 'ALT-9919', user: 'Charlie Brown', type: 'Large International Wire', risk: 'High', status: 'Investigating', time: '3 hours ago' },
  { id: 'ALT-9918', user: 'Diana Prince', type: 'Suspicious Device Signature', risk: 'Low', status: 'Resolved', time: '1 day ago' },
];

export function FraudMonitoring() {
  const [actionAlert, setActionAlert] = useState<typeof MOCK_ALERTS[0] | null>(null);
  const [actionType, setActionType] = useState<'block' | 'clear' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAlertAction = async (alert: typeof MOCK_ALERTS[0], type: 'block' | 'clear') => {
    setActionAlert(alert);
    setActionType(type);
  };

  const confirmAction = async () => {
    if (!actionAlert || !actionType) return;
    setActionLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`Alert ${actionAlert.id} ${actionType === 'block' ? 'blocked' : 'cleared'} successfully`);
    setActionLoading(false);
    setActionAlert(null);
    setActionType(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fraud Monitoring</h1>
          <p className="text-slate-500">Monitor and respond to suspicious account activities in real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-red-600 hover:bg-red-700">
            <ShieldAlert className="mr-2 h-4 w-4" /> Global Lockdown
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 shrink-0 mb-2">
        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">High Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">12</div>
            <p className="text-xs text-red-700 mt-1 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" /> Needs immediate attention
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">45</div>
            <p className="text-xs text-amber-700 mt-1">In last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Auto-Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">89%</div>
            <p className="text-xs text-green-700 mt-1">AI intervention success rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search alerts..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Trigger Event</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ALERTS.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-mono text-xs">{alert.id}</TableCell>
                    <TableCell className="font-medium">{alert.user}</TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        alert.risk === 'High' ? 'border-red-500 text-red-700 bg-red-50' :
                        alert.risk === 'Medium' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                        'border-green-500 text-green-700 bg-green-50'
                      }>
                        {alert.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{alert.time}</TableCell>
                    <TableCell>
                      <Badge variant={alert.status === 'Resolved' ? 'secondary' : 'default'} className={alert.status === 'Pending' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}>
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAlertAction(alert, 'block')}>
                        <XCircle className="h-4 w-4 mr-1" /> Block
                      </Button>
                      <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleAlertAction(alert, 'clear')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!actionAlert}
        onOpenChange={(open) => { if (!open) { setActionAlert(null); setActionType(null); } }}
        title={actionType === 'block' ? 'Block User' : 'Clear Alert'}
        description={
          actionAlert
            ? `Are you sure you want to ${actionType} alert ${actionAlert.id} for user ${actionAlert.user}?`
            : ''
        }
        confirmLabel={actionType === 'block' ? 'Block' : 'Clear'}
        variant={actionType === 'block' ? 'destructive' : 'default'}
        loading={actionLoading}
        onConfirm={confirmAction}
      />
    </div>
  );
}
