import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '@/services/auth';
import { customer } from '@/services/customer';
import { 
  Home, 
  CreditCard, 
  ArrowRightLeft, 
  History, 
  Settings as SettingsIcon, 
  Bell, 
  Search,
  Menu,
  LogOut,
  Users,
  ShieldAlert,
  BarChart3,
  BookOpen,
  Key,
  PieChart,
  Landmark,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const customerNavigation: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', path: '/customer' },
  { icon: Wallet, label: 'Accounts', path: '/customer/accounts' },
  { icon: ArrowRightLeft, label: 'Transfers', path: '/customer/transfers' },
  { icon: History, label: 'Transactions', path: '/customer/transactions' },
  { icon: CreditCard, label: 'Cards', path: '/customer/cards' },
  { icon: Landmark, label: 'Loans', path: '/customer/loans' },
  { icon: Users, label: 'Beneficiaries', path: '/customer/beneficiaries' },
  { icon: BookOpen, label: 'Statements', path: '/customer/statements' },
  { icon: SettingsIcon, label: 'Settings', path: '/customer/settings' },
];

const adminNavigation: SidebarItem[] = [
  { icon: BarChart3, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: History, label: 'Transactions', path: '/admin/transactions' },
  { icon: PieChart, label: 'Reports', path: '/admin/reports' },
  { icon: ShieldAlert, label: 'Fraud Alerts', path: '/admin/fraud' },
];

const devNavigation: SidebarItem[] = [
  { icon: PieChart, label: 'Overview', path: '/dev-portal' },
  { icon: BarChart3, label: 'Analytics', path: '/dev-portal/analytics' },
  { icon: BookOpen, label: 'API Docs', path: '/dev-portal/docs' },
  { icon: Key, label: 'API Keys', path: '/dev-portal/keys' },
];

export function DashboardLayout({ role }: { role: 'customer' | 'admin' | 'developer' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const session = auth.getSession();
      if (!session || !session.accessToken) {
        auth.clearSession();
        navigate('/login');
        return;
      }

      try {
        const userRole = session?.user?.role?.toUpperCase();

        if (userRole === 'CUSTOMER') {
          const custProfile = await customer.getProfile();
          setProfile({
            name: `${custProfile.firstName} ${custProfile.lastName}`,
            role: 'Premium Account',
            profileImage: custProfile.profileImage,
          });
        } else {
          const authProfile = await auth.getProfile();
          setProfile({
            name: authProfile.name,
            role: authProfile.role,
            profileImage: '',
          });
        }
      } catch (err) {
        auth.clearSession();
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch {
      // Ignore
    }
    navigate('/login');
  };

  let navigation = customerNavigation;
  if (role === 'admin') navigation = adminNavigation;
  if (role === 'developer') navigation = devNavigation;

  const NavLinks = () => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col sm:flex-row bg-background font-sans text-foreground overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col bg-slate-900 shrink-0 sm:flex sm:static">
        <div className="p-6 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              DB
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">DigitalBank</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto px-4 py-2">
          <nav className="flex-1 space-y-1">
            <div className="mb-4 mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {role === 'customer' ? 'Main Menu' : role === 'admin' ? 'Admin Panel' : 'Dev Portal'}
            </div>
            <NavLinks />
          </nav>
        </div>
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 border border-slate-600 flex items-center justify-center text-white overflow-hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.profileImage ? `http://localhost:3002${profile.profileImage}` : "https://github.com/shadcn.png"} alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <p className="text-sm font-medium text-white truncate">{profile?.name || 'Loading...'}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.role || 'Premium Account'}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8" onClick={() => navigate('/customer/settings')}>
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0">
          <Sheet>
            <SheetTrigger render={<Button size="icon" variant="outline" className="sm:hidden mr-2" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-slate-900 border-slate-800">
              <SheetTitle className="text-white">DigitalBank</SheetTitle>
              <SheetDescription className="sr-only">Navigation Menu</SheetDescription>
              <nav className="grid gap-2 text-lg font-medium py-6">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm">
            <span>Pages</span> <span>/</span> <span className="text-foreground font-medium capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 ml-auto sm:ml-0">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-xs w-64 focus-visible:ring-2 focus-visible:ring-blue-500 h-9 transition-all"
              />
            </div>
            <ModeToggle />
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
