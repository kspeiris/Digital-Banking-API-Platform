import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, Key, Eye, EyeOff, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { developerService, GeneratedKey } from '@/services/developer';

interface ApiKeyRow {
  id: string;
  name: string;
  token: string;
  environment: string;
  created: string;
  lastUsed: string;
}

export function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('Development');
  const [generating, setGenerating] = useState(false);
  const [deleteKey, setDeleteKey] = useState<ApiKeyRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const apis = await developerService.getApis();
      const mapped: ApiKeyRow[] = apis.map((api, idx) => ({
        id: `key-${idx}`,
        name: api.name,
        token: `pk_live_${api.name.toLowerCase().replace(/\s/g, '_')}_${Math.random().toString(36).slice(2, 10)}`,
        environment: 'Production',
        created: new Date(Date.now() - Math.random() * 1e10).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        lastUsed: Math.random() > 0.5 ? 'Today, 14:32' : 'Never',
      }));
      setKeys(mapped);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleGenerate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    setGenerating(true);
    try {
      const result: GeneratedKey = await developerService.generateApiKey(newKeyName);
      toast.success('API Key generated successfully');
      setNewKeyName('');
      setNewKeyEnv('Development');
      loadKeys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteKey) return;
    setDeleting(true);
    try {
      await developerService.revokeApiKey(deleteKey.token);
      toast.success('API key revoked successfully');
      setDeleteKey(null);
      loadKeys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke API key');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API Key copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">API Keys</h1>
          <p className="text-slate-500">Manage your API keys for application access.</p>
        </div>
        
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Generate New Key
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to authenticate your applications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input id="name" placeholder="e.g. Production Web App" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <select className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-9">
                  <option>Development</option>
                  <option>Production</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Generate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Keep your keys secure</h4>
          <p className="text-sm mt-1 text-amber-700">
            Do not share your API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
          </p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>Manage keys used by your applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-700">No API keys found</p>
              <p className="text-xs text-slate-400 mt-1">Generate your first key to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-slate-400" />
                          {key.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono text-sm bg-slate-50 px-2 py-1 rounded w-fit">
                          {showKey === key.id ? key.token : '••••••••••••••••'}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-2"
                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                          >
                            {showKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleCopy(key.token)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={key.environment === 'Production' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {key.environment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{key.created}</TableCell>
                      <TableCell className="text-sm text-slate-500">{key.lastUsed}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteKey(key)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteKey}
        onOpenChange={(open) => !open && setDeleteKey(null)}
        title="Revoke API Key"
        description={`Are you sure you want to revoke the API key for "${deleteKey?.name}"? This action cannot be undone.`}
        confirmLabel="Revoke"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
