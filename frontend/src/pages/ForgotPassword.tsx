import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPassword() {
  const [step, setStep] = useState(1);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('OTP sent to your registered email');
    setStep(2);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('OTP verified successfully');
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password reset successfully');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white border-slate-200 shadow-xl">
        <CardHeader className="space-y-1 items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === 1 && "Enter your email address to receive a verification code."}
            {step === 2 && "Enter the 6-digit code sent to your email."}
            {step === 3 && "Create a new strong password."}
          </CardDescription>
        </CardHeader>
        
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="name@example.com" required />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full">
                Send Reset Code <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-center text-sm">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input id="otp" type="text" placeholder="123456" maxLength={6} required className="text-center text-2xl tracking-widest" />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full">
                Verify Code
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => toast.success('New code sent')}>
                Resend Code
              </Button>
            </CardFooter>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
