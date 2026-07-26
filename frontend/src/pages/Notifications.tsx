import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Trash2, Loader2, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { notificationService, Notification } from '@/services/notification';
import { auth } from '@/services/auth';
import { adminService, AdminCustomer } from '@/services/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [markingRead, setMarkingRead] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [newNotification, setNewNotification] = useState({ userId: '', title: '', message: '', type: 'PUSH' });
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'PUSH', targetRole: 'ALL' });
  
  // Customer Search States for Admin picker
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => {
    const session = auth.getSession();
    const role = session?.user?.role?.toUpperCase() || '';
    setUserRole(role);
  }, []);

  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      return;
    }
    setCustomersLoading(true);
    try {
      const result = await adminService.searchCustomers({ page: 1, limit: 10, search: query });
      setCustomers(result.data || []);
    } catch (err: any) {
      console.error('Failed to search customers', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!showCreateDialog) {
      setSearchQuery('');
      setCustomers([]);
    }
  }, [showCreateDialog]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const readParam = filter === 'all' ? undefined : filter === 'read';
      const result = await notificationService.getNotifications(page, limit, undefined, undefined, readParam);
      setNotifications(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page, filter]);

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select notifications to mark as read');
      return;
    }
    setMarkingRead(true);
    try {
      await notificationService.markAsRead(selectedIds);
      toast.success(`${selectedIds.length} notifications marked as read`);
      setSelectedIds([]);
      loadNotifications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark notifications as read');
    } finally {
      setMarkingRead(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await notificationService.deleteNotification(deleteId);
      toast.success('Notification deleted successfully');
      setDeleteId(null);
      // Adjust page if we deleted the last item on the page
      if (notifications.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadNotifications();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.userId) {
      toast.error('Please select a target customer first');
      return;
    }
    setSending(true);
    try {
      await notificationService.create({
        userId: newNotification.userId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
      });
      toast.success('Notification sent successfully');
      setShowCreateDialog(false);
      setNewNotification({ userId: '', title: '', message: '', type: 'PUSH' });
      if (userRole === 'ADMIN') loadNotifications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationService.broadcast({
        title: broadcast.title,
        message: broadcast.message,
        type: broadcast.type,
        targetRole: broadcast.targetRole,
      });
      toast.success('Broadcast sent successfully');
      setShowBroadcastDialog(false);
      setBroadcast({ title: '', message: '', type: 'PUSH', targetRole: 'ALL' });
      if (userRole === 'ADMIN') loadNotifications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      LOGIN: 'bg-blue-50 text-blue-700 border-blue-200',
      TRANSFER: 'bg-green-50 text-green-700 border-green-200',
      CARD: 'bg-purple-50 text-purple-700 border-purple-200',
      LOAN: 'bg-amber-50 text-amber-700 border-amber-200',
      SECURITY: 'bg-red-50 text-red-700 border-red-200',
      PROMOTION: 'bg-pink-50 text-pink-700 border-pink-200',
      SYSTEM: 'bg-muted text-foreground border-border',
    };
    return (
      <Badge variant="outline" className={colors[category] || 'bg-muted text-foreground border-border'}>
        {category}
      </Badge>
    );
  };

  const isCustomer = userRole === 'CUSTOMER';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {isCustomer ? 'Stay updated with your account activity.' : 'Broadcast and manage platform notifications.'}
          </p>
        </div>
        <div className="flex gap-2">
          {userRole === 'ADMIN' && (
            <>
              <Button variant="outline" onClick={() => setShowBroadcastDialog(true)}>
                <Send className="mr-2 h-4 w-4" /> Broadcast
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Notification
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="bg-background border-border shadow-sm">
        <CardHeader className="border-b bg-muted">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex gap-2">
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('all')}>All</Button>
              <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('unread')}>Unread</Button>
              <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange('read')}>Read</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-foreground">No notifications found</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`flex items-start gap-4 p-4 hover:bg-muted transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                >
                  {isCustomer && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.notificationId)}
                      onChange={() => toggleSelect(notification.notificationId)}
                      className="mt-1 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(notification.category)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {isCustomer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 shrink-0"
                      onClick={() => setDeleteId(notification.notificationId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!loading && total > limit && (
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} notifications
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(total / limit)))}
              disabled={page >= Math.ceil(total / limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {isCustomer && notifications.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleMarkAsRead} disabled={selectedIds.length === 0 || markingRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark as Read
          </Button>
        </div>
      )}

      {/* Create Notification Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Send a notification to a specific user.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerSearch">Target Customer</Label>
              <Input
                id="customerSearch"
                required={!newNotification.userId}
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {customersLoading && <p className="text-xs text-muted-foreground">Searching...</p>}
              {customers.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow-sm z-50">
                  <p className="text-xs text-muted-foreground px-2 pt-2 pb-1">{customers.length} result{customers.length !== 1 ? 's' : ''} found</p>
                  {customers.map((c) => (
                    <div
                      key={c.customerId}
                      className={`px-3 py-2 cursor-pointer hover:bg-muted text-sm border-t border-slate-50 ${newNotification.userId === c.userId ? 'bg-blue-50 font-medium' : ''}`}
                      onClick={() => {
                        setNewNotification({ ...newNotification, userId: c.userId });
                        setSearchQuery(`${c.name} (${c.email})`);
                        setCustomers([]);
                      }}
                    >
                      <p className="text-foreground font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  ))}
                </div>
              )}
              {newNotification.userId && (
                <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-800 truncate">{searchQuery}</p>
                    <p className="text-[10px] text-blue-500">Recipient selected ✓</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setNewNotification({ ...newNotification, userId: '' }); setSearchQuery(''); setCustomers([]); }}
                    className="text-blue-400 hover:text-blue-700 shrink-0 text-sm font-bold"
                    aria-label="Clear selection"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input id="title" required value={newNotification.title} onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })} placeholder="e.g. Your transfer was successful" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message Body</Label>
              <Textarea id="message" required value={newNotification.message} onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })} placeholder="Write the full notification message here..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Delivery Channel</Label>
              <Select value={newNotification.type} onValueChange={(v) => setNewNotification({ ...newNotification, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUSH">Push (In-App)</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={sending || !newNotification.userId}>{sending ? 'Sending...' : 'Send'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Broadcast Notification</DialogTitle>
            <DialogDescription>Send a broadcast notification to all users or a specific role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bTitle">Broadcast Title</Label>
              <Input id="bTitle" required value={broadcast.title} onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })} placeholder="e.g. Scheduled maintenance on Saturday" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bMessage">Message Body</Label>
              <Textarea id="bMessage" required value={broadcast.message} onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} placeholder="Write the full broadcast message here..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bType">Delivery Channel</Label>
              <Select value={broadcast.type} onValueChange={(v) => setBroadcast({ ...broadcast, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUSH">Push (In-App)</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRole">Send To <span className="text-muted-foreground font-normal text-xs">— who will receive this broadcast</span></Label>
              <Select value={broadcast.targetRole} onValueChange={(v) => setBroadcast({ ...broadcast, targetRole: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users (everyone)</SelectItem>
                  <SelectItem value="CUSTOMER">Customers only</SelectItem>
                  <SelectItem value="ADMIN">Admins only</SelectItem>
                  <SelectItem value="DEVELOPER">Developers only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBroadcastDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Broadcast'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
