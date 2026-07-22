import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { customer, CustomerProfile } from '@/services/customer';

export function Settings() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500">Manage your account preferences, verification, and security.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm md:col-span-1 flex flex-col items-center justify-center p-6 text-center">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Profile Photo</CardTitle>
              </CardHeader>
              <div className="w-24 h-24 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden mb-4">
                <img
                  src={profile?.profileImage ? `http://localhost:3002${profile.profileImage}` : 'https://github.com/shadcn.png'}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <Label htmlFor="avatar-file" className="cursor-pointer bg-slate-100 hover:bg-slate-200 border px-4 py-2 rounded-md text-xs font-semibold">
                Change Photo
              </Label>
              <Input id="avatar-file" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="text-slate-400 text-xs mt-2">Max 5MB (JPG, PNG, WEBP)</div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your contact and personal details.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleProfileChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={formData.phone} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input id="occupation" value={formData.occupation} onChange={handleProfileChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={handleProfileChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={formData.country} onChange={handleProfileChange} />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="mt-4">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Identity Verification (KYC)</CardTitle>
              <CardDescription>
                Submit your documents to complete verification. Status: {' '}
                <span className={`font-bold ${profile?.kycStatus === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profile?.kycStatus || 'PENDING'}
                </span>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleKycSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kyc-occupation">Occupation</Label>
                    <Input
                      id="kyc-occupation"
                      value={kycData.occupation}
                      onChange={(e) => setKycData({ ...kycData, occupation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (LKR)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="e.g. 150000"
                      value={kycData.monthlyIncome}
                      onChange={(e) => setKycData({ ...kycData, monthlyIncome: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>NIC Front Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'nicFront')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>NIC Back Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'nicBack')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Selfie Photo</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Proof Document</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'addressProof')} required />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading || profile?.kycStatus === 'VERIFIED'} className="mt-4">
                  {isLoading ? 'Submitting...' : 'Submit Verification Docs'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Security configurations and password resets are managed securely via OTP.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
