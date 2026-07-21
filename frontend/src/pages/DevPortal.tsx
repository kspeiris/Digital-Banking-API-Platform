import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Activity, Clock, ServerCrash } from 'lucide-react';
import { toast } from 'sonner';

export function DevPortal() {
  const handleGenerateKey = () => {
    toast.success('New API Key generated successfully');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
          <p className="text-muted-foreground">Manage your API integrations and monitor usage.</p>
        </div>
        <Button onClick={handleGenerateKey}>
          <Key className="mr-2 h-4 w-4" /> Generate New Key
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <p className="text-xs text-muted-foreground">99th percentile</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <ServerCrash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">Within SLA</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Applications</CardTitle>
          <CardDescription>Applications using your API keys.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Payment Gateway Integration</h4>
                <p className="text-sm text-muted-foreground">Environment: Production</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono bg-muted px-2 py-1 rounded">pk_live_*******************a1b2</div>
                <Button variant="link" size="sm" className="h-auto p-0 mt-1">Reveal</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Mobile App Backend</h4>
                <p className="text-sm text-muted-foreground">Environment: Staging</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono bg-muted px-2 py-1 rounded">pk_test_*******************x9y8</div>
                <Button variant="link" size="sm" className="h-auto p-0 mt-1">Reveal</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
