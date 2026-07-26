import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { LandingPage } from '@/pages/LandingPage';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { Accounts } from '@/pages/Accounts';
import { TransferDashboard } from '@/pages/TransferDashboard';
import { TransactionHistory } from '@/pages/TransactionHistory';
import { CardsDashboard } from '@/pages/CardsDashboard';
import { Loans } from '@/pages/Loans';
import { Settings } from '@/pages/Settings';
import { Beneficiaries } from '@/pages/Beneficiaries';
import { Statements } from '@/pages/Statements';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { Users } from '@/pages/Users';
import { AdminTransactions } from '@/pages/AdminTransactions';
import { AdminCards } from '@/pages/AdminCards';
import { AdminCardRequests } from '@/pages/AdminCardRequests';
import { AdminAccounts } from '@/pages/AdminAccounts';
import { AdminLoans } from '@/pages/AdminLoans';
import { Reports } from '@/pages/Reports';
import { FraudMonitoring } from '@/pages/FraudMonitoring';
import { DevPortal } from '@/pages/DevPortal';
import { ApiDocs } from '@/pages/ApiDocs';
import { ApiKeys } from '@/pages/ApiKeys';
import { ApiAnalytics } from '@/pages/ApiAnalytics';
import { Notifications } from '@/pages/Notifications';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Customer Dashboard Routes */}
        <Route path="/customer" element={<DashboardLayout role="customer" />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transfers" element={<TransferDashboard />} />
          <Route path="transactions" element={<TransactionHistory />} />
          <Route path="cards" element={<CardsDashboard />} />
          <Route path="loans" element={<Loans />} />
          <Route path="settings" element={<Settings />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="statements" element={<Statements />} />
          <Route path="notifications" element={<Notifications />} />
          {/* Catch-all customer route redirects to dashboard */}
          <Route path="*" element={<Navigate to="/customer" replace />} />
        </Route>

         {/* Administrator Routes */}
         <Route path="/admin" element={<DashboardLayout role="admin" />}>
           <Route index element={<AdminDashboard />} />
           <Route path="users" element={<Users />} />
           <Route path="accounts" element={<AdminAccounts />} />
           <Route path="cards" element={<AdminCards />} />
           <Route path="card-requests" element={<AdminCardRequests />} />
           <Route path="transactions" element={<AdminTransactions />} />
           <Route path="loans" element={<AdminLoans />} />
           <Route path="reports" element={<Reports />} />
           <Route path="fraud" element={<FraudMonitoring />} />
           <Route path="notifications" element={<Notifications />} />
           <Route path="settings" element={<Settings />} />
         </Route>

        {/* Developer Portal Routes */}
        <Route path="/dev-portal" element={<DashboardLayout role="developer" />}>
          <Route index element={<DevPortal />} />
          <Route path="docs" element={<ApiDocs />} />
          <Route path="keys" element={<ApiKeys />} />
          <Route path="analytics" element={<ApiAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
