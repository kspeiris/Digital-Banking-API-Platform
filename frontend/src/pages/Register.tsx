import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Registration is currently closed for the demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <Link to="/login" className="text-primary hover:underline font-medium">
            Return to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
