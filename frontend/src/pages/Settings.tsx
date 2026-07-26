import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { customer, CustomerProfile } from '@/services/customer';
import { auth } from '@/services/auth';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function Settings() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const session = auth.getSession();
  const userRole = session?.user?.role?.toUpperCase() || '';
  const isCustomer = userRole === 'CUSTOMER';

  // Edit Profile Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    occupation: '',
  });

  // KYC Form State
  const [kycData, setKycData] = useState({
    occupation: '',
    monthlyIncome: '',
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    nicFront: null,
    nicBack: null,
    selfie: null,
    addressProof: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!isCustomer) {
      setFormData({
        firstName: 'System',
        lastName: userRole.toLowerCase(),
        phone: '',
        address: '',
        city: '',
        country: '',
        occupation: userRole,
      });
      return;
    }

    try {
      const data = await customer.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        occupation: data.occupation || '',
      });
      setKycData({
        occupation: data.occupation || '',
        monthlyIncome: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch customer profile.');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await customer.updateProfile(formData);
      setIsLoading(false);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('profileImage', file);

    setIsLoading(true);
    try {
      const res = await customer.uploadProfileImage(data);
      setIsLoading(false);
      toast.success('Avatar uploaded successfully');
      fetchProfile();
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Failed to upload avatar.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files?.[0]) {
      setFiles({
        ...files,
        [field]: e.target.files[0],
      });
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.nicFront || !files.nicBack || !files.selfie || !files.addressProof) {
      toast.error('Please upload all required KYC documents');
      return;
    }

    const data = new FormData();
    data.append('occupation', kycData.occupation);
    data.append('monthlyIncome', kycData.monthlyIncome);
    data.append('nicFront', files.nicFront);
    data.append('nicBack', files.nicBack);
    data.append('selfie', files.selfie);
    data.append('addressProof', files.addressProof);

    setIsLoading(true);
    try {
      await customer.submitKyc(data);
      setIsLoading(false);
      toast.success('KYC documents submitted successfully. Status: PENDING review');
      fetchProfile();
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Failed to submit KYC.');
    }
  };

  const handlePasswordChange = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await auth.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto px-4 sm:px-6">
      <div className="flex flex-col gap-1.5 pt-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight dark:text-foreground">Settings</h1>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm">
          Manage your account preferences, verification, and security options.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="line" className="w-full justify-start border-b border-border dark:border-border rounded-none mb-6 gap-8 h-12 px-0 bg-transparent">
          <TabsTrigger value="profile" className="pb-3 px-1 rounded-none text-muted-foreground hover:text-slate-955 data-active:text-blue-600 data-active:after:bg-blue-600 font-semibold text-base">Profile Details</TabsTrigger>
          {isCustomer && (
            <TabsTrigger value="kyc" className="pb-3 px-1 rounded-none text-muted-foreground hover:text-slate-955 data-active:text-blue-600 data-active:after:bg-blue-600 font-semibold text-base">KYC Verification</TabsTrigger>
          )}
          <TabsTrigger value="security" className="pb-3 px-1 rounded-none text-muted-foreground hover:text-slate-955 data-active:text-blue-600 data-active:after:bg-blue-600 font-semibold text-base">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-background border-border shadow-sm overflow-hidden w-full dark:bg-background dark:border-border">
            {/* Gradient Banner Accent */}
            <div className="h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            </div>

            <CardContent className="px-6 pb-8 pt-0 relative sm:px-8">
              {/* Photo Upload & Identity Profile Section */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-8 pb-6 border-b border-slate-100 dark:border-border">
                <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-border bg-muted shadow-md overflow-hidden flex items-center justify-center cursor-pointer">
                  <img
                    src={profile?.profileImage ? `http://localhost:3002${profile.profileImage}` : 'https://github.com/shadcn.png'}
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                  />
                  <label htmlFor="avatar-file" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    <span className="text-[11px] font-bold tracking-wide">Change Photo</span>
                  </label>
                  <Input id="avatar-file" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className="flex-1 pb-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground leading-tight">
                    {formData.firstName || 'Digital'} {formData.lastName || 'Customer'}
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1.5 font-medium">
                    {profile?.occupation || 'Customer'}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                    Max 5MB (JPG, PNG, WEBP)
                  </p>
                </div>
              </div>

              {/* Personal Information Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground dark:text-foreground">Personal Information</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-0.5">
                    Update your contact and location details.
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground dark:text-muted-foreground font-semibold">First Name</Label>
                      <Input id="firstName" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.firstName} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground dark:text-muted-foreground font-semibold">Last Name</Label>
                      <Input id="lastName" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.lastName} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground dark:text-muted-foreground font-semibold">Phone Number</Label>
                      <Input id="phone" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.phone} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="text-foreground dark:text-muted-foreground font-semibold">Occupation</Label>
                      <Input id="occupation" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.occupation} onChange={handleProfileChange} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-foreground dark:text-muted-foreground font-semibold">Address</Label>
                      <Input id="address" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.address} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-foreground dark:text-muted-foreground font-semibold">City</Label>
                      <Input id="city" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.city} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-foreground dark:text-muted-foreground font-semibold">Country</Label>
                      <Input id="country" className="h-10 border-border focus:border-blue-500 focus:ring-blue-500" value={formData.country} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-5 border-t border-slate-100 dark:border-border">
                    <Button type="submit" disabled={isLoading} className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm w-full sm:w-auto">
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground max-w-md">
                      Changes will be saved to your profile immediately. Make sure all contact details are accurate.
                    </span>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isCustomer && (
          <TabsContent value="kyc">
            <Card className="bg-background border-border shadow-sm dark:bg-background dark:border-border">
              <CardHeader className="border-b border-slate-100 dark:border-border px-6 sm:px-8 py-5">
                <CardTitle className="text-xl font-bold text-foreground dark:text-foreground">Identity Verification (KYC)</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Submit documents to verify your profile. Status:{' '}
                  <span className={`font-bold ml-1 px-2.5 py-0.5 rounded-full text-xs ${
                    profile?.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                    profile?.kycStatus === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                    'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    {profile?.kycStatus || 'PENDING'}
                  </span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleKycSubmit}>
                <CardContent className="space-y-6 px-6 sm:px-8 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="kyc-occupation" className="text-foreground dark:text-muted-foreground font-semibold">Occupation</Label>
                      <Input
                        id="kyc-occupation"
                        className="h-10"
                        value={kycData.occupation}
                        onChange={(e) => setKycData({ ...kycData, occupation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome" className="text-foreground dark:text-muted-foreground font-semibold">Monthly Income (LKR)</Label>
                      <Input
                        id="monthlyIncome"
                        className="h-10"
                        type="number"
                        placeholder="e.g. 150000"
                        value={kycData.monthlyIncome}
                        onChange={(e) => setKycData({ ...kycData, monthlyIncome: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 dark:border-border pt-5">
                    <h4 className="text-sm font-bold text-foreground dark:text-foreground uppercase tracking-wider">Required Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2 p-4 border border-slate-100 dark:border-border rounded-lg bg-muted/50 dark:bg-muted/30">
                        <Label className="text-foreground dark:text-muted-foreground font-semibold block mb-1">NIC Front Image <span className="text-red-500">*</span></Label>
                        <Input type="file" accept="image/jpeg,image/png,image/webp" className="h-10 bg-background dark:bg-background" onChange={(e) => handleFileChange(e, 'nicFront')} required />
                        <p className="text-xs text-muted-foreground">Clear photo of the <strong>front side</strong> of your National Identity Card. JPG, PNG or WEBP &mdash; max 5MB.</p>
                        {files.nicFront && <p className="text-xs text-green-600 font-medium">✓ {files.nicFront.name}</p>}
                      </div>
                      <div className="space-y-2 p-4 border border-slate-100 dark:border-border rounded-lg bg-muted/50 dark:bg-muted/30">
                        <Label className="text-foreground dark:text-muted-foreground font-semibold block mb-1">NIC Back Image <span className="text-red-500">*</span></Label>
                        <Input type="file" accept="image/jpeg,image/png,image/webp" className="h-10 bg-background dark:bg-background" onChange={(e) => handleFileChange(e, 'nicBack')} required />
                        <p className="text-xs text-muted-foreground">Clear photo of the <strong>back side</strong> of your National Identity Card. JPG, PNG or WEBP &mdash; max 5MB.</p>
                        {files.nicBack && <p className="text-xs text-green-600 font-medium">✓ {files.nicBack.name}</p>}
                      </div>
                      <div className="space-y-2 p-4 border border-slate-100 dark:border-border rounded-lg bg-muted/50 dark:bg-muted/30">
                        <Label className="text-foreground dark:text-muted-foreground font-semibold block mb-1">Selfie Photo <span className="text-red-500">*</span></Label>
                        <Input type="file" accept="image/jpeg,image/png,image/webp" className="h-10 bg-background dark:bg-background" onChange={(e) => handleFileChange(e, 'selfie')} required />
                        <p className="text-xs text-muted-foreground">A clear <strong>face photo</strong> taken now (not a scanned image). Face must be centered, lit, and unobstructed. JPG, PNG or WEBP &mdash; max 5MB.</p>
                        {files.selfie && <p className="text-xs text-green-600 font-medium">✓ {files.selfie.name}</p>}
                      </div>
                      <div className="space-y-2 p-4 border border-slate-100 dark:border-border rounded-lg bg-muted/50 dark:bg-muted/30">
                        <Label className="text-foreground dark:text-muted-foreground font-semibold block mb-1">Address Proof Document <span className="text-red-500">*</span></Label>
                        <Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="h-10 bg-background dark:bg-background" onChange={(e) => handleFileChange(e, 'addressProof')} required />
                        <p className="text-xs text-muted-foreground">Utility bill, bank statement, or government letter showing your <strong>current address</strong> (dated within 3 months). JPG, PNG, WEBP or PDF &mdash; max 5MB.</p>
                        {files.addressProof && <p className="text-xs text-green-600 font-medium">✓ {files.addressProof.name}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-border flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button type="submit" disabled={isLoading || profile?.kycStatus === 'VERIFIED'} className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm">
                      {isLoading ? 'Submitting...' : 'Submit Verification Docs'}
                    </Button>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground max-w-sm">
                      All submitted files are secure and encrypted. Verification may take up to 2-3 business days.
                    </span>
                  </div>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card className="bg-background border border-border shadow-sm dark:bg-background dark:border-border">
            <CardHeader className="border-b border-slate-100 dark:border-border px-6 sm:px-8 py-5">
              <CardTitle className="text-xl font-bold text-foreground dark:text-foreground">Security Settings</CardTitle>
              <CardDescription className="text-sm mt-1">Manage and configure your password and access levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-6 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-border rounded-xl bg-muted/40 dark:bg-muted/10 gap-4">
                <div>
                  <p className="font-bold text-foreground dark:text-foreground">Account Password</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">Regularly change your password to keep your account safe</p>
                </div>
                <Button onClick={() => setShowPasswordDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all h-9 px-5">
                  Change Password
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 dark:border-border rounded-xl bg-muted/40 dark:bg-muted/10 gap-4">
                <div>
                  <p className="font-bold text-foreground dark:text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">Protect operations and transfers with authentication codes</p>
                </div>
                <Button variant="outline" className="border-border text-foreground font-semibold hover:bg-muted h-9 px-5 dark:border-border dark:text-muted-foreground dark:hover:bg-muted">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        title="Change Password"
        description="Enter your current password and choose a new password."
        confirmLabel={isChangingPassword ? 'Changing...' : 'Change Password'}
        loading={isChangingPassword}
        onConfirm={handlePasswordChange}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4 mt-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              required
              minLength={8}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>
        </form>
      </ConfirmDialog>
    </div>
  );
}
