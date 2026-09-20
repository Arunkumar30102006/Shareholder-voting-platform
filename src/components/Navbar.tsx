import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Building2,
  LogOut,
  ShieldCheck,
  Home,
  Menu,
  X,
  BookOpen,
  Layers,
  ChevronDown,
  Lock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Navbar = () => {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is a protected portal
  const isPortalPage =
    location.pathname.includes("/company-dashboard") ||
    location.pathname.includes("/voting-management") ||
    location.pathname.includes("/voting-dashboard") ||
    location.pathname.includes("/ai-power-suite");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const initAuth = async () => {
      const hasToken =
        typeof window !== "undefined" &&
        Object.keys(localStorage).some(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
        );
      if (hasToken || isPortalPage) {
        const { supabase } = await import("@/integrations/supabase/client");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setIsLoggedIn(!!session);
        });
        unsubscribe = () => subscription.unsubscribe();
      }
    };
    initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isPortalPage]);

  // Throttled Scroll listener for auto-hiding navbar on scroll down & glassmorphism
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > 70 && currentScrollY > lastScrollY) {
            // Scrolling down -> Hide navbar
            setIsVisible(false);
          } else {
            // Scrolling up or at top -> Show navbar
            setIsVisible(true);
          }

          setIsScrolled(currentScrollY > 20);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavigation = useCallback(
    (e: React.MouseEvent, path: string) => {
      if (
        isPortalPage &&
        isLoggedIn &&
        (path === "/" ||
          path === "/company-register" ||
          path === "/shareholder-login" ||
          path === "/company-login")
      ) {
        e.preventDefault();
        setPendingPath(path);
        setShowLogoutAlert(true);
      } else {
        setIsMobileMenuOpen(false); // Close mobile menu on navigation
      }
    },
    [isPortalPage, isLoggedIn]
  );

  const confirmNavigation = async () => {
    if (pendingPath) {
      if (isLoggedIn) {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.auth.signOut();
      }
      navigate(pendingPath);
      setPendingPath(null);
      setShowLogoutAlert(false);
    }
  };

  return (
    <>
      <header
        role="banner"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 w-full px-4 md:px-6 pointer-events-none transition-all duration-500 ease-in-out ${
          !isVisible
            ? "-translate-y-28 opacity-0 pointer-events-none"
            : isScrolled
            ? "translate-y-4 opacity-100"
            : "translate-y-6 opacity-100"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Logo Island */}
          <div className="pointer-events-auto flex items-center h-[56px] px-5 rounded-full bg-[#020817]/70 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 hover:border-white/20 transition-all flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img src="/logo-48.webp" alt="Vote India Secure Logo" width={32} height={32} decoding="async" className="h-8 w-8 object-contain rounded-lg" />
              <span className="text-lg font-bold text-white tracking-tight hidden sm:block">Vote Secure</span>
            </Link>
          </div>

          {/* Center: Links Island with Clean Dropdowns */}
          <div className="pointer-events-auto hidden xl:flex items-center justify-center gap-1 h-[56px] px-3 rounded-full bg-[#020817]/70 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40">
            {/* Home */}
            <NavLink
              to="/"
              onClick={(e) => handleNavigation(e, "/")}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-semibold whitespace-nowrap px-3.5 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>

            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-all outline-none px-3.5 py-2 rounded-full hover:bg-white/5 data-[state=open]:bg-white/10 data-[state=open]:text-white">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Solutions</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-[#020817]/95 backdrop-blur-2xl border-white/10 text-white mt-4 rounded-2xl p-2 shadow-2xl" align="start">
                <DropdownMenuItem asChild>
                  <Link to="/shareholder-e-voting" onClick={(e) => handleNavigation(e, '/shareholder-e-voting')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Users className="w-4 h-4 mr-2.5 text-blue-400" />
                    Shareholder E-Voting
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/agm-voting" onClick={(e) => handleNavigation(e, '/agm-voting')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Building2 className="w-4 h-4 mr-2.5 text-indigo-400" />
                    AGM E-Voting
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/egm-voting" onClick={(e) => handleNavigation(e, '/egm-voting')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Layers className="w-4 h-4 mr-2.5 text-amber-400" />
                    EGM Balloting
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/proxy-voting" onClick={(e) => handleNavigation(e, '/proxy-voting')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 mr-2.5 text-cyan-400" />
                    Proxy Voting (Sec 105)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/scrutinizer-tools" onClick={(e) => handleNavigation(e, '/scrutinizer-tools')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Shield className="w-4 h-4 mr-2.5 text-emerald-400" />
                    Scrutinizer Audit Tools
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/corporate-voting" onClick={(e) => handleNavigation(e, '/corporate-voting')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Shield className="w-4 h-4 mr-2.5 text-purple-400" />
                    Corporate Governance
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Trust & Compliance Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-all outline-none px-3.5 py-2 rounded-full hover:bg-white/5 data-[state=open]:bg-white/10 data-[state=open]:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security &amp; Compliance</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-[#020817]/95 backdrop-blur-2xl border-white/10 text-white mt-4 rounded-2xl p-2 shadow-2xl" align="start">
                <DropdownMenuItem asChild>
                  <Link to="/resources" onClick={(e) => handleNavigation(e, '/resources')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <BookOpen className="w-4 h-4 mr-2.5 text-blue-400" />
                    Statutory Knowledge Base
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/regulatory-framework" onClick={(e) => handleNavigation(e, '/regulatory-framework')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 mr-2.5 text-emerald-400" />
                    Regulatory Framework
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/compliance" onClick={(e) => handleNavigation(e, '/compliance')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 mr-2.5 text-teal-400" />
                    Statutory Compliance Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/security" onClick={(e) => handleNavigation(e, '/security')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Lock className="w-4 h-4 mr-2.5 text-cyan-400" />
                    Technical Security Model
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/how-it-works" onClick={(e) => handleNavigation(e, '/how-it-works')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Home className="w-4 h-4 mr-2.5 text-indigo-400" />
                    How It Works
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faqs" onClick={(e) => handleNavigation(e, '/faqs')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <BookOpen className="w-4 h-4 mr-2.5 text-amber-400" />
                    E-Voting Knowledge Center (FAQs)
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources & Company Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-all outline-none px-3.5 py-2 rounded-full hover:bg-white/5 data-[state=open]:bg-white/10 data-[state=open]:text-white">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Company</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#020817]/95 backdrop-blur-2xl border-white/10 text-white mt-4 rounded-2xl p-2 shadow-2xl" align="start">
                <DropdownMenuItem asChild>
                  <Link to="/about" onClick={(e) => handleNavigation(e, '/about')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Users className="w-4 h-4 mr-2.5 text-blue-400" />
                    About Us
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog" onClick={(e) => handleNavigation(e, '/blog')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <BookOpen className="w-4 h-4 mr-2.5 text-indigo-400" />
                    Blog &amp; Regulatory Guides
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/live-demo" onClick={(e) => handleNavigation(e, '/live-demo')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Layers className="w-4 h-4 mr-2.5 text-cyan-400" />
                    Interactive Live Demo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" onClick={(e) => handleNavigation(e, '/contact')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-xs font-medium">
                    <Shield className="w-4 h-4 mr-2.5 text-emerald-400" />
                    Contact &amp; Grievance
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Login Island & Mobile Menu Trigger */}
          <div className="pointer-events-auto flex items-center h-[56px] px-2 rounded-full bg-[#020817]/70 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 flex-shrink-0">
            <div className="hidden xl:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-all outline-none px-4 py-2 rounded-full hover:bg-white/5 data-[state=open]:bg-white/10 border border-transparent data-[state=open]:border-white/10">
                  Login / Register <ChevronDown className="w-4 h-4 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#020817]/95 backdrop-blur-2xl border-white/10 text-white mt-4 rounded-2xl p-2 shadow-2xl" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/shareholder-login" onClick={(e) => handleNavigation(e, '/shareholder-login')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-400" />
                      Shareholder Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/company-login" onClick={(e) => handleNavigation(e, '/company-login')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center mt-1">
                      <Building2 className="w-4 h-4 mr-2 text-amber-400" />
                      Company Portal
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-white/10 my-1 mx-2" />
                  <DropdownMenuItem asChild>
                    <Link to="/company-register" onClick={(e) => handleNavigation(e, '/company-register')} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2.5 w-full flex items-center text-emerald-400 focus:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Register Company
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="xl:hidden text-slate-300 hover:text-white p-2 mx-1 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Fixed to viewport) */}
        {isMobileMenuOpen && (
          <div className="xl:hidden pointer-events-auto fixed top-[90px] left-4 right-4 bg-[#020817]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-4 flex flex-col gap-2 z-40 max-h-[calc(100vh-120px)] overflow-y-auto">
            <NavLink
              to="/"
              onClick={(e) => handleNavigation(e, "/")}
              className={({ isActive }) =>
                `flex items-center gap-3 text-base font-medium px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/10 border-l-2 border-primary"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Home className="w-5 h-5 text-cyan-400" />
              Home
            </NavLink>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4">Solutions</span>
              <div className="flex flex-col gap-1 mt-1">
                <Link to="/shareholder-e-voting" onClick={(e) => handleNavigation(e, '/shareholder-e-voting')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Users className="w-4 h-4 text-blue-400" /> Shareholder E-Voting
                </Link>
                <Link to="/agm-voting" onClick={(e) => handleNavigation(e, '/agm-voting')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Building2 className="w-4 h-4 text-indigo-400" /> AGM E-Voting
                </Link>
                <Link to="/egm-voting" onClick={(e) => handleNavigation(e, '/egm-voting')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Layers className="w-4 h-4 text-amber-400" /> EGM Balloting
                </Link>
                <Link to="/proxy-voting" onClick={(e) => handleNavigation(e, '/proxy-voting')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Proxy Voting (Sec 105)
                </Link>
                <Link to="/scrutinizer-tools" onClick={(e) => handleNavigation(e, '/scrutinizer-tools')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Scrutinizer Audit Tools
                </Link>
                <Link to="/corporate-voting" onClick={(e) => handleNavigation(e, '/corporate-voting')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Shield className="w-4 h-4 text-purple-400" /> Corporate Governance
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4">Statutory &amp; Security</span>
              <div className="flex flex-col gap-1 mt-1">
                <Link to="/resources" onClick={(e) => handleNavigation(e, '/resources')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Statutory Knowledge Base
                </Link>
                <Link to="/regulatory-framework" onClick={(e) => handleNavigation(e, '/regulatory-framework')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Regulatory Framework
                </Link>
                <Link to="/compliance" onClick={(e) => handleNavigation(e, '/compliance')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" /> Statutory Compliance Hub
                </Link>
                <Link to="/security" onClick={(e) => handleNavigation(e, '/security')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Lock className="w-4 h-4 text-cyan-400" /> Technical Security Model
                </Link>
                <Link to="/how-it-works" onClick={(e) => handleNavigation(e, '/how-it-works')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Home className="w-4 h-4 text-indigo-400" /> How It Works
                </Link>
                <Link to="/faqs" onClick={(e) => handleNavigation(e, '/faqs')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <BookOpen className="w-4 h-4 text-amber-400" /> E-Voting FAQs
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4">Company</span>
              <div className="flex flex-col gap-1 mt-1">
                <Link to="/about" onClick={(e) => handleNavigation(e, '/about')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Users className="w-4 h-4 text-blue-400" /> About Us
                </Link>
                <Link to="/blog" onClick={(e) => handleNavigation(e, '/blog')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Blog &amp; Insights
                </Link>
                <Link to="/contact" onClick={(e) => handleNavigation(e, '/contact')} className="flex items-center gap-3 text-sm px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Contact Us
                </Link>
              </div>
            </div>
            <div className="px-4 py-4 mt-2 border-t border-white/5 flex flex-col gap-2">
              <Link to="/shareholder-login" onClick={(e) => handleNavigation(e, '/shareholder-login')} className="flex items-center gap-3 text-base font-medium text-slate-300 hover:text-white transition-colors p-3 rounded-xl hover:bg-white/5">
                <Users className="w-5 h-5 text-blue-400" /> Shareholder Login
              </Link>
              <Link to="/company-login" onClick={(e) => handleNavigation(e, '/company-login')} className="flex items-center gap-3 text-base font-medium text-slate-300 hover:text-white transition-colors p-3 rounded-xl hover:bg-white/5">
                <Building2 className="w-5 h-5 text-amber-400" /> Company Portal
              </Link>
              <Link to="/company-register" onClick={(e) => handleNavigation(e, '/company-register')} className="flex items-center gap-3 text-base font-medium text-emerald-400 hover:text-emerald-300 transition-colors p-3 rounded-xl hover:bg-white/5">
                <ShieldCheck className="w-5 h-5" /> Register Company
              </Link>
            </div>
          </div>
        )}
      </header>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="bg-[#0f172a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Leave Company Portal?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You are currently logged in. Navigating away will log you out of your current session.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPath(null)} className="bg-transparent border-white/10 hover:bg-white/5 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation} className="bg-red-600 hover:bg-red-700 text-white border-0">
              <LogOut className="w-4 h-4 mr-2" />
              Logout & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
