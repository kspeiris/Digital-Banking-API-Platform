import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function Settings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact and personal details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Alexander" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Pierce" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue="alexander.pierce@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Financial District, New York, NY 10004" />
                </div>
                <Button type="submit" className="mt-4">Save Changes</Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and authentication methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border-b pb-6">
                <h4 className="font-semibold text-sm">Change Password</h4>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
                <Button variant="outline">Update Password</Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  <Button variant="secondary">Enable 2FA</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Active Sessions</h4>
                    <p className="text-xs text-slate-500">Manage devices logged into your account.</p>
                  </div>
                  <Button variant="destructive" size="sm">Log Out All Devices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be alerted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Login Alerts</h4>
                  <p className="text-xs text-slate-500">Get notified of new logins on unrecognized devices.</p>
                </div>
                <Select defaultValue="email">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Transaction Alerts</h4>
                  <p className="text-xs text-slate-500">Get notified for transactions above a certain limit.</p>
                </div>
                <Select defaultValue="push">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Monthly Statements</h4>
                  <p className="text-xs text-slate-500">Receive your monthly account statements.</p>
                </div>
                <Select defaultValue="email">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="mail">Physical Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
