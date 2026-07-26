import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertTriangle, Search, CheckCircle, XCircle, Loader2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { adminService, FraudAlert } from '@/services/admin';
import { auth } from '@/services/auth';

export function FraudMonitoring() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionAlert, setActionAlert] = useState<FraudAlert | null>(null);
  const [actionType, setActionType] = useState<'block' | 'clear' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lockdownLoading, setLockdownLoading] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFraudAlerts();
      setAlerts(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load fraud alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAlertAction = async (alert: FraudAlert, type: 'block' | 'clear') => {
    setActionAlert(alert);
    setActionType(type);
  };

  const confirmAction = async () => {
    if (!actionAlert || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'block') {
        await adminService.freezeByUserId(actionAlert.userId, 'Flagged by fraud monitoring system');
        toast.success(`User ${actionAlert.user} has been blocked`);
      } else {
        await adminService.unfreezeByUserId(actionAlert.userId, 'Cleared by fraud monitoring');
        toast.success(`Alert ${actionAlert.id} cleared and user unfrozen`);
      }
      setActionAlert(null);
      setActionType(null);
      loadAlerts();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionType} alert`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGlobalLockdown = async () => {
    setLockdownLoading(true);
    try {
      const pendingAlerts = (alerts || []).filter(a => a.status === 'Pending' && (a.risk === 'High' || a.risk === 'Critical'));
      let blocked = 0;
      for (const alert of pendingAlerts) {
        try {
          await adminService.freezeByUserId(alert.userId, 'Global lockdown - high risk fraud alert');
          blocked++;
        } catch (err) {
          console.error(`Failed to block user ${alert.userId}:`, err);
        }
      }
      toast.success(`Global lockdown complete. ${blocked} user(s) blocked.`);
      loadAlerts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute global lockdown');
    } finally {
      setLockdownLoading(false);
    }
  };

  const safeAlerts = alerts || [];

  const filteredAlerts = safeAlerts.filter(alert =>
    alert.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highRiskCount = safeAlerts.filter(a => a.risk === 'High' || a.risk === 'Critical').length;
  const pendingCount = safeAlerts.filter(a => a.status === 'Pending').length;
  const resolvedCount = safeAlerts.filter(a => a.status === 'Resolved').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Fraud Monitoring</h1>
          <p className="text-muted-foreground">Monitor and respond to suspicious account activities in real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleGlobalLockdown} disabled={lockdownLoading || highRiskCount === 0}>
            {lockdownLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
            {lockdownLoading ? 'Locking Down...' : 'Global Lockdown'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 shrink-0 mb-2">
        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">High Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{highRiskCount}</div>
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
            <div className="text-3xl font-bold text-amber-900">{pendingCount}</div>
            <p className="text-xs text-amber-700 mt-1">In last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Auto-Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{resolvedCount > 0 ? Math.round((resolvedCount / alerts.length) * 100) : 0}%</div>
            <p className="text-xs text-green-700 mt-1">AI intervention success rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background border border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alerts..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
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
                  {filteredAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No alerts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlerts.map((alert) => (
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
                        <TableCell className="text-sm text-muted-foreground">{new Date(alert.time).toLocaleString()}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
