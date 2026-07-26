import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Copy, Code, Terminal, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { developerService, DeveloperApi } from '@/services/developer';

export function ApiDocs() {
  const [apis, setApis] = useState<DeveloperApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    developerService.getApis()
      .then(setApis)
      .catch((err) => toast.error(err.message || 'Failed to load API docs'))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">Integrate DigitalBank services into your applications.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download OpenAPI Spec</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <div className="font-semibold text-sm mb-2 text-foreground px-3">Getting Started</div>
          <Button variant="ghost" className="w-full justify-start bg-muted font-medium">Authentication</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Rate Limits</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Errors</Button>
          
          <div className="font-semibold text-sm mb-2 mt-6 text-foreground px-3">Endpoints</div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Accounts</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Transactions</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Transfers</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Cards</Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="flex h-[30vh] items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              <Card className="bg-background border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    All API requests must be authenticated using a Bearer token in the Authorization header.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-white"
                      onClick={() => handleCopy('Authorization: Bearer YOUR_API_KEY')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <div><span className="text-pink-400">Authorization</span>: Bearer YOUR_API_KEY</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can generate API keys from the <a href="/api-keys" className="text-blue-600 hover:underline">API Keys</a> section in your developer portal.
                  </p>
                </CardContent>
              </Card>

              {apis.map((api) => (
                <Card key={api.name} className="bg-background border-border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className={`${api.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} hover:bg-opacity-80 font-mono`}>GET</Badge>
                      <CardTitle className="text-lg font-mono">/v1/{api.name.toLowerCase().replace(/\s+/g, '-')}</CardTitle>
                    </div>
                    <CardDescription>
                      {api.name} endpoint - Version {api.version}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="curl"><Terminal className="mr-2 h-4 w-4" /> cURL</TabsTrigger>
                        <TabsTrigger value="node"><Code className="mr-2 h-4 w-4" /> Node.js</TabsTrigger>
                        <TabsTrigger value="python"><Code className="mr-2 h-4 w-4" /> Python</TabsTrigger>
                      </TabsList>

                      <TabsContent value="curl">
                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 relative overflow-x-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-muted-foreground hover:text-white"
                            onClick={() => handleCopy(`curl -X GET https://api.digitalbank.com/v1/${api.name.toLowerCase().replace(/\s+/g, '-')} \\n  -H "Authorization: Bearer YOUR_API_KEY"`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <pre>
{`curl -X GET https://api.digitalbank.com/v1/${api.name.toLowerCase().replace(/\s+/g, '-')} \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="node">
                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 relative overflow-x-auto">
                           <pre>
{`const axios = require('axios');

axios.get('https://api.digitalbank.com/v1/${api.name.toLowerCase().replace(/\s+/g, '-')}', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`}
                           </pre>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6">
                      <h4 className="font-semibold text-sm mb-3">Response</h4>
                      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                        <pre>
{`{
  "status": "success",
  "data": []
}`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
