import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { auth } from '@/services/auth';

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP Verification
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nic: '',
    dateOfBirth: '',
  });

  // OTP State
  const [otp, setOtp] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      await auth.register(formData);
      setIsLoading(false);
      toast.success('Registration successful. OTP sent to email.');
      setStep(2);
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Registration failed.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.verifyOtp(formData.email, otp);
      setIsLoading(false);
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Verification failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-bold">NB</span>
          </div>
          Nexus Banking
        </Link>
      </div>

      <Card className="w-full max-w-lg shadow-lg border-muted">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Enter your details below to register a retail customer account'
              : `Enter the 6-digit OTP verification code sent to ${formData.email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="0771234567" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nic">NIC Number</Label>
                  <Input id="nic" placeholder="200012345678" value={formData.nic} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Activate'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
