import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { notificationService, Notification } from '@/services/notification';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [markingRead, setMarkingRead] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications(1, 50);
      setNotifications(result.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

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
      loadNotifications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete notification');
    } finally {
      setDeleting(false);
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
      SYSTEM: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <Badge variant="outline" className={colors[category] || 'bg-slate-100 text-slate-700 border-slate-200'}>
        {category}
      </Badge>
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'read') return n.read;
    if (filter === 'unread') return !n.read;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500">Stay updated with your account activity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAsRead} disabled={selectedIds.length === 0 || markingRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark as Read
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex gap-2">
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
              <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>Unread</Button>
              <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('read')}>Read</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.notificationId)}
                    onChange={() => toggleSelect(notification.notificationId)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(notification.category)}
                      <span className="text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 shrink-0"
                    onClick={() => setDeleteId(notification.notificationId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
