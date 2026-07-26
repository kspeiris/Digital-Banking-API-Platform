import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Clock, ServerCrash, Zap, Loader2 } from 'lucide-react';
import { developerService, AnalyticsSummary } from '@/services/developer';
import { toast } from 'sonner';

export function ApiAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const data = await developerService.getAnalytics();
        setAnalytics(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">API Analytics</h1>
          <p className="text-muted-foreground">Monitor your application's API usage and performance.</p>
        </div>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalRequests = analytics?.totalRequests || 0;
  const successRate = totalRequests > 0 ? ((analytics?.successfulRequests || 0) / totalRequests) * 100 : 0;
  const errorRate = totalRequests > 0 ? ((analytics?.failedRequests || 0) / totalRequests) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">API Analytics</h1>
          <p className="text-muted-foreground">Monitor your application's API usage and performance.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 shrink-0 mb-2">
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="mr-2 h-4 w-4 text-blue-500" /> Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{timeframe === '24h' ? 'Last 24 hours' : timeframe === '7d' ? 'Last 7 days' : 'Last 30 days'}</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <ServerCrash className="mr-2 h-4 w-4 text-red-500" /> Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{errorRate.toFixed(2)}%</div>
            <p className="text-xs text-green-600 mt-1">{(analytics?.failedRequests || 0).toLocaleString()} failed requests</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="mr-2 h-4 w-4 text-amber-500" /> Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics?.averageResponseTime || '0ms'}</div>
            <p className="text-xs text-green-600 mt-1">{successRate.toFixed(1)}% success rate</p>
          </CardContent>
        </Card>
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Zap className="mr-2 h-4 w-4 text-purple-500" /> Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{(analytics?.successfulRequests || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background border-border shadow-sm">
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most frequently accessed API endpoints.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 font-mono">GET</Badge>
                  <span className="font-mono text-sm">/v1/accounts</span>
                </div>
                <span className="font-medium text-foreground">{Math.round(totalRequests * 0.3).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 font-mono">POST</Badge>
                  <span className="font-mono text-sm">/v1/transfers</span>
                </div>
                <span className="font-medium text-foreground">{Math.round(totalRequests * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 font-mono">GET</Badge>
                  <span className="font-mono text-sm">/v1/transactions</span>
                </div>
                <span className="font-medium text-foreground">{Math.round(totalRequests * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 font-mono">GET</Badge>
                  <span className="font-mono text-sm">/v1/cards</span>
                </div>
                <span className="font-medium text-foreground">{Math.round(totalRequests * 0.15).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Latest failed API requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="font-mono">401</Badge>
                    <span className="font-mono text-sm text-foreground">/v1/accounts</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Invalid API Key</p>
                </div>
                <span className="text-xs text-muted-foreground">2 mins ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="font-mono">422</Badge>
                    <span className="font-mono text-sm text-foreground">/v1/transfers</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Insufficient Funds</p>
                </div>
                <span className="text-xs text-muted-foreground">15 mins ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-600 font-mono">429</Badge>
                    <span className="font-mono text-sm text-foreground">/v1/transactions</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Rate Limit Exceeded</p>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
