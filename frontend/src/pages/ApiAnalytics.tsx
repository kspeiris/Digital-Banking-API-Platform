import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Clock, ServerCrash, Zap } from 'lucide-react';

export function ApiAnalytics() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">API Analytics</h1>
          <p className="text-slate-500">Monitor your application's API usage and performance.</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7d">
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
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Activity className="mr-2 h-4 w-4 text-blue-500" /> Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1.2M</div>
            <p className="text-xs text-green-600 mt-1">+14% from last period</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <ServerCrash className="mr-2 h-4 w-4 text-red-500" /> Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">0.12%</div>
            <p className="text-xs text-green-600 mt-1">-0.05% from last period</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-amber-500" /> Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">45ms</div>
            <p className="text-xs text-slate-500 mt-1">Consistent with last period</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Zap className="mr-2 h-4 w-4 text-purple-500" /> Active Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">4</div>
            <p className="text-xs text-slate-500 mt-1">Across 2 environments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
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
                <span className="font-medium text-slate-700">450K</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 font-mono">POST</Badge>
                  <span className="font-mono text-sm">/v1/transfers</span>
                </div>
                <span className="font-medium text-slate-700">320K</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 font-mono">GET</Badge>
                  <span className="font-mono text-sm">/v1/transactions</span>
                </div>
                <span className="font-medium text-slate-700">280K</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 font-mono">GET</Badge>
                  <span className="font-mono text-sm">/v1/cards</span>
                </div>
                <span className="font-medium text-slate-700">150K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
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
                    <span className="font-mono text-sm text-slate-700">/v1/accounts</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Invalid API Key</p>
                </div>
                <span className="text-xs text-slate-400">2 mins ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="font-mono">422</Badge>
                    <span className="font-mono text-sm text-slate-700">/v1/transfers</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Insufficient Funds</p>
                </div>
                <span className="text-xs text-slate-400">15 mins ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-600 font-mono">429</Badge>
                    <span className="font-mono text-sm text-slate-700">/v1/transactions</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Rate Limit Exceeded</p>
                </div>
                <span className="text-xs text-slate-400">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
