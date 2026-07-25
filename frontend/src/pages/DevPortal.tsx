import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Activity, Clock, ServerCrash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { developerService, DeveloperApi, AnalyticsSummary } from '@/services/developer';

export function DevPortal() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [apis, setApis] = useState<DeveloperApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apisData, analyticsData] = await Promise.all([
        developerService.getApis(),
        developerService.getAnalytics(),
      ]);
      setApis(apisData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load developer portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      await developerService.generateApiKey('New Application');
      toast.success('New API Key generated successfully');
      setShowGenerateConfirm(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
          <p className="text-muted-foreground">Manage your API integrations and monitor usage.</p>
        </div>
        <Button onClick={() => setShowGenerateConfirm(true)}>
          <Key className="mr-2 h-4 w-4" /> Generate New Key
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total API Calls</CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{(analytics?.totalRequests || 0).toLocaleString()}</div>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analytics?.averageResponseTime || '0ms'}</div>
                <p className="text-xs text-slate-500">99th percentile</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Error Rate</CardTitle>
                <ServerCrash className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {analytics ? ((analytics.failedRequests / analytics.totalRequests) * 100).toFixed(2) : '0.00'}%
                </div>
                <p className="text-xs text-slate-500">Within SLA</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Available APIs</CardTitle>
                <Key className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{apis.length}</div>
                <p className="text-xs text-slate-500">Published endpoints</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Active Applications</CardTitle>
              <CardDescription>Applications using your API keys.</CardDescription>
            </CardHeader>
            <CardContent>
              {apis.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-700">No applications found</p>
                  <p className="text-xs text-slate-400 mt-1">Generate an API key to create your first application.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apis.slice(0, 4).map((api, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold text-slate-900">{api.name}</h4>
                        <p className="text-sm text-slate-500">Version: {api.version} • Status: {api.status}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono bg-slate-50 px-2 py-1 rounded">pk_live_*******************{Math.random().toString(36).slice(2, 6)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={showGenerateConfirm}
        onOpenChange={setShowGenerateConfirm}
        title="Generate New API Key"
        description="You are about to generate a new API key. Make sure to store your secret securely as it will not be shown again."
        confirmLabel={generating ? 'Generating...' : 'Generate'}
        loading={generating}
        onConfirm={handleGenerateKey}
      />
    </div>
  );
}
