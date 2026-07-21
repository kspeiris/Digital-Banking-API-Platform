import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { ArrowRight, ShieldCheck, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="font-bold">NB</span>
            </div>
            Nexus Banking
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a>
            <a href="#security" className="text-muted-foreground hover:text-primary transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Open an Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-bottom" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-2xl">
                <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                  Next Generation Digital Banking
                </motion.div>
                <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
                  Banking made <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">borderless.</span>
                </motion.h1>
                <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-8 max-w-lg">
                  Experience seamless transfers, intelligent insights, and enterprise-grade security with the Nexus API Platform.
                </motion.p>
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto text-base">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/dev-portal">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                      Explore APIs
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
              >
                <div className="relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:rounded-3xl lg:p-4 backdrop-blur-sm">
                  <img src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=1000" alt="App dashboard preview" className="rounded-xl shadow-2xl ring-1 ring-slate-900/10 object-cover aspect-[4/3] w-full" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need in a modern bank</h2>
              <p className="text-lg text-muted-foreground">Built on top of our powerful microservices architecture to deliver speed, reliability, and scale.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Instant Transfers", desc: "Send money globally in seconds with our optimized routing network." },
                { icon: ShieldCheck, title: "Bank-grade Security", desc: "Multi-factor authentication, end-to-end encryption, and real-time fraud monitoring." },
                { icon: Smartphone, title: "Mobile Optimized", desc: "Access your dashboard from any device with our fully responsive interface." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background rounded-2xl p-8 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">NB</div>
                Nexus Banking
              </div>
              <p className="text-sm text-muted-foreground">Digital banking for the modern economy.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary">Dashboard</Link></li>
                <li><Link to="/dev-portal" className="hover:text-primary">Developer API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexus Banking Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
