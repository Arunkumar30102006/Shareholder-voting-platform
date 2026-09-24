import { useState, useEffect, useCallback, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Layers,
  ChevronDown,
  Lock,
  Vote,
  Sparkles,
  CheckCircle2,
  UserPlus,
  Home,
  HelpCircle,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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
import { PillButton } from "@/components/common/PillButton";

const Navbar = () => {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDropdownEnter = (menu: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(menu);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Lock body scroll when mobile menu is open to prevent background scrolling
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Automatically close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  const handleNavigation = useCallback(
    (e: React.MouseEvent, path: string) => {
      setOpenDropdown(null);
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
        setIsMobileMenuOpen(false);
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

  const handleDirectLogout = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <header
        role="banner"
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 w-full bg-[#020817]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40 transition-colors"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">

            {/* ─── LEFT: BRAND LOGO ─── */}
            <div className="flex items-center pr-3 sm:pr-6 lg:pr-8 border-r-0 lg:border-r border-white/10 shrink-0">
              <Link
                to="/"
                onClick={(e) => handleNavigation(e, "/")}
                className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
              >
                <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 border border-blue-400/30 group-hover:border-cyan-400/60 transition-all shrink-0">
                  <img
                    src="/logo-48.webp"
                    alt="Vote India Secure Logo"
                    width={26}
                    height={26}
                    decoding="async"
                    className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-white group-hover:text-cyan-300 transition-colors uppercase whitespace-nowrap">
                    VOTE<span className="text-cyan-400 ml-1">SECURE</span>
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] lg:text-[9px] font-extrabold tracking-[0.16em] sm:tracking-[0.2em] text-slate-400 uppercase -mt-0.5 whitespace-nowrap">
                    MCA &amp; SEBI E-VOTING
                  </span>
                </div>
              </Link>
            </div>

            {/* ─── CENTER-RIGHT: STRUCTURED UPPERCASE NAVIGATION LINKS (DESKTOP ONLY) ─── */}
            <nav className="hidden lg:flex items-center gap-2 xl:gap-4 2xl:gap-6 ml-3 xl:ml-6 mr-4" role="navigation">

              {/* 1. HOME OPTION */}
              <NavLink
                to="/"
                onClick={(e) => handleNavigation(e, "/")}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md border text-[11px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center ${
                    isActive
                      ? "bg-white/10 border-white/20 text-cyan-400 shadow-sm"
                      : "border-transparent text-white hover:text-cyan-300 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-sm"
                  }`
                }
              >
                HOME
              </NavLink>

              {/* 2. SOLUTIONS / PRODUCTS DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("solutions")}
                onMouseLeave={handleDropdownLeave}
              >
                <DropdownMenu
                  open={openDropdown === "solutions"}
                  onOpenChange={(open) => setOpenDropdown(open ? "solutions" : null)}
                >
                  <DropdownMenuTrigger
                    className={`px-3 py-1.5 rounded-md border text-[11px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 outline-none cursor-pointer ${
                      openDropdown === "solutions"
                        ? "bg-white/10 border-white/20 text-cyan-300 shadow-sm"
                        : "border-transparent text-white hover:text-cyan-300 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-sm"
                    }`}
                  >
                    <span>SOLUTIONS</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    onMouseEnter={() => handleDropdownEnter("solutions")}
                    onMouseLeave={handleDropdownLeave}
                    className="w-80 bg-[#0a1122]/98 backdrop-blur-2xl border border-white/15 text-white rounded-lg p-2 shadow-2xl mt-1 animate-in fade-in zoom-in-95 duration-150"
                    align="start"
                  >
                    <DropdownMenuLabel className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2.5 py-1.5 border-b border-white/10 mb-1">
                      E-Voting Solutions &amp; Resolutions
                    </DropdownMenuLabel>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/shareholder-e-voting"
                        onClick={(e) => handleNavigation(e, "/shareholder-e-voting")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <Users className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            Shareholder E-Voting
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            MCA Rule 20 Remote &amp; Live ballot portal
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/agm-voting"
                        onClick={(e) => handleNavigation(e, "/agm-voting")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            AGM General Meetings
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            Section 108 electronic voting &amp; quorum
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/egm-voting"
                        onClick={(e) => handleNavigation(e, "/egm-voting")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            EGM Special Ballots
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            Requisitions under Section 100
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/proxy-voting"
                        onClick={(e) => handleNavigation(e, "/proxy-voting")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <Vote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            Proxy Lodgment (Sec 105)
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            Form MGT-11 authorized proxies
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 3. AUDIT & SCRUTINIZER SERVICES DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("services")}
                onMouseLeave={handleDropdownLeave}
              >
                <DropdownMenu
                  open={openDropdown === "services"}
                  onOpenChange={(open) => setOpenDropdown(open ? "services" : null)}
                >
                  <DropdownMenuTrigger
                    className={`px-3 py-1.5 rounded-md border text-[11px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 outline-none cursor-pointer ${
                      openDropdown === "services"
                        ? "bg-white/10 border-white/20 text-cyan-300 shadow-sm"
                        : "border-transparent text-white hover:text-cyan-300 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-sm"
                    }`}
                  >
                    <span>SERVICES</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    onMouseEnter={() => handleDropdownEnter("services")}
                    onMouseLeave={handleDropdownLeave}
                    className="w-80 bg-[#0a1122]/98 backdrop-blur-2xl border border-white/15 text-white rounded-lg p-2 shadow-2xl mt-1 animate-in fade-in zoom-in-95 duration-150"
                    align="start"
                  >
                    <DropdownMenuLabel className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2.5 py-1.5 border-b border-white/10 mb-1">
                      Statutory Services &amp; Scrutineers
                    </DropdownMenuLabel>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/scrutinizer-tools"
                        onClick={(e) => handleNavigation(e, "/scrutinizer-tools")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            Scrutinizer Audit Suite
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            Dual-key cryptographic unblocking &amp; Form MGT-13
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/corporate-voting"
                        onClick={(e) => handleNavigation(e, "/corporate-voting")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            Corporate Governance
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            Board meetings, postal ballots &amp; equity schemes
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/live-demo"
                        onClick={(e) => handleNavigation(e, "/live-demo")}
                        className="flex items-start gap-3 p-2.5 w-full"
                      >
                        <Vote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                            Interactive Sandbox Demo
                          </div>
                          <div className="text-[11px] text-slate-300 group-hover:text-slate-100">
                            Test live voting &amp; instant audit validation
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 4. COMPLIANCE & GOVERNANCE DROPDOWN */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("compliance")}
                onMouseLeave={handleDropdownLeave}
              >
                <DropdownMenu
                  open={openDropdown === "compliance"}
                  onOpenChange={(open) => setOpenDropdown(open ? "compliance" : null)}
                >
                  <DropdownMenuTrigger
                    className={`px-3 py-1.5 rounded-md border text-[11px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 outline-none cursor-pointer ${
                      openDropdown === "compliance"
                        ? "bg-white/10 border-white/20 text-cyan-300 shadow-sm"
                        : "border-transparent text-white hover:text-cyan-300 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-sm"
                    }`}
                  >
                    <span>COMPLIANCE</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    onMouseEnter={() => handleDropdownEnter("compliance")}
                    onMouseLeave={handleDropdownLeave}
                    className="w-72 bg-[#0a1122]/98 backdrop-blur-2xl border border-white/15 text-white rounded-lg p-2 shadow-2xl mt-1 animate-in fade-in zoom-in-95 duration-150"
                    align="start"
                  >
                    <DropdownMenuLabel className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2.5 py-1.5 border-b border-white/10 mb-1">
                      Statutory &amp; Technical Standards
                    </DropdownMenuLabel>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/regulatory-framework"
                        onClick={(e) => handleNavigation(e, "/regulatory-framework")}
                        className="flex items-center gap-2.5 p-2.5 w-full"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                          Regulatory Framework
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/security"
                        onClick={(e) => handleNavigation(e, "/security")}
                        className="flex items-center gap-2.5 p-2.5 w-full"
                      >
                        <Lock className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                          Security &amp; Merkle Ledger
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/compliance"
                        onClick={(e) => handleNavigation(e, "/compliance")}
                        className="flex items-center gap-2.5 p-2.5 w-full"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                          Compliance Hub
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-blue-600/20 data-[highlighted]:bg-blue-600/20 hover:bg-blue-600/20 outline-none cursor-pointer rounded transition-colors group">
                      <Link
                        to="/about"
                        onClick={(e) => handleNavigation(e, "/about")}
                        className="flex items-center gap-2.5 p-2.5 w-full"
                      >
                        <Users className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 uppercase tracking-wide">
                          About Platform
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 5. INSIGHTS / RESOURCES */}
              <NavLink
                to="/blog"
                onClick={(e) => handleNavigation(e, "/blog")}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md border text-[11px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center ${
                    isActive
                      ? "bg-white/10 border-white/20 text-cyan-400 shadow-sm"
                      : "border-transparent text-white hover:text-cyan-300 hover:bg-white/[0.08] hover:border-white/15 hover:shadow-sm"
                  }`
                }
              >
                INSIGHTS
              </NavLink>

              {/* 6. COMPANY REGISTRATION */}
              <Link
                to="/company-register"
                onClick={(e) => handleNavigation(e, "/company-register")}
                className="px-3 py-1.5 rounded-md border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10 text-[11px] xl:text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-all duration-200 flex items-center hover:shadow-sm"
              >
                REGISTER
              </Link>
            </nav>

            {/* ─── FAR RIGHT: DESKTOP ACTIONS / MOBILE HAMBURGER ─── */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto pl-2 sm:pl-4 lg:pl-6 xl:pl-8 border-l-0 lg:border-l border-white/10">

              {isLoggedIn ? (
                /* Authenticated User Actions */
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <PillButton
                    to="/company-dashboard"
                    onClick={(e) => handleNavigation(e, "/company-dashboard")}
                    label="DASHBOARD"
                    className="bg-slate-200 text-[#020817] font-black uppercase tracking-wider text-[11px] sm:text-xs px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm rounded whitespace-nowrap shrink-0"
                    circleClassName="bg-cyan-400"
                    labelClassName="text-[#020817] font-black uppercase tracking-wider text-[11px] sm:text-xs"
                    hoverLabelClassName="text-[#020817] font-black uppercase tracking-wider text-[11px] sm:text-xs"
                  />
                  <button
                    onClick={handleDirectLogout}
                    title="Sign Out"
                    className="text-slate-300 hover:text-red-400 transition-colors p-1.5 sm:p-2 shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Public Call To Action Buttons (Desktop Only - hidden on mobile < lg) */
                <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
                  {/* Voter Portal (React Bits Pill Animation) */}
                  <PillButton
                    to="/shareholder-login"
                    onClick={(e) => handleNavigation(e, "/shareholder-login")}
                    label="VOTER PORTAL"
                    className="border border-white/20 hover:border-cyan-400/80 text-white font-extrabold uppercase tracking-wider text-xs px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded whitespace-nowrap shrink-0 bg-white/[0.03]"
                    circleClassName="bg-cyan-400"
                    labelClassName="text-white font-extrabold uppercase tracking-wider text-xs"
                    hoverLabelClassName="text-[#020817] font-black uppercase tracking-wider text-xs"
                  />

                  {/* Admin Login Button (React Bits Pill Animation) */}
                  <PillButton
                    to="/company-login"
                    onClick={(e) => handleNavigation(e, "/company-login")}
                    label="ADMIN LOGIN"
                    className="border border-white/20 hover:border-cyan-400/80 text-white font-extrabold uppercase tracking-wider text-xs px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded whitespace-nowrap shrink-0 bg-white/[0.03]"
                    circleClassName="bg-cyan-500"
                    labelClassName="text-white font-extrabold uppercase tracking-wider text-xs"
                    hoverLabelClassName="text-[#020817] font-black uppercase tracking-wider text-xs"
                  />

                  {/* Contact Us Solid Action Button (React Bits Pill Animation) */}
                  <PillButton
                    to="/contact"
                    onClick={(e) => handleNavigation(e, "/contact")}
                    label="CONTACT US"
                    className="bg-slate-200 text-[#020817] font-black uppercase tracking-wider text-xs px-4 py-2.5 sm:px-5 sm:py-2.5 shadow-sm rounded hidden xl:inline-flex whitespace-nowrap shrink-0"
                    circleClassName="bg-white"
                    labelClassName="text-[#020817] font-black uppercase tracking-wider text-xs"
                    hoverLabelClassName="text-[#020817] font-black uppercase tracking-wider text-xs"
                  />
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden text-white hover:text-cyan-400 p-2 -mr-1 rounded-md hover:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER (MOUNTED OUTSIDE HEADER AS A VIEWPORT SIBLING) ─── */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden fixed inset-x-0 top-16 sm:top-18 md:top-20 bottom-0 z-[49] bg-[#020817] border-t border-white/10 overflow-y-auto overscroll-contain px-5 py-6 flex flex-col justify-between"
          style={{ minHeight: "calc(100dvh - 4rem)" }}
        >
          <div className="space-y-6">

            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/company-dashboard"
                    onClick={(e) => handleNavigation(e, "/company-dashboard")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-[#020817] font-black uppercase tracking-wider text-xs py-3 px-2 text-center rounded shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DASHBOARD</span>
                  </Link>
                  <button
                    onClick={handleDirectLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-black uppercase tracking-wider text-xs py-3 px-2 text-center rounded shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>LOGOUT</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/shareholder-login"
                    onClick={(e) => handleNavigation(e, "/shareholder-login")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-[#020817] font-black uppercase tracking-wider text-xs py-3 px-2 text-center rounded shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>VOTER PORTAL</span>
                  </Link>

                  <Link
                    to="/company-login"
                    onClick={(e) => handleNavigation(e, "/company-login")}
                    className="bg-slate-200 hover:bg-white text-[#020817] font-black uppercase tracking-wider text-xs py-3 px-2 text-center rounded shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>ADMIN LOGIN</span>
                  </Link>
                </>
              )}
            </div>

            {/* Company Registration Highlight for New Companies */}
            {!isLoggedIn && (
              <Link
                to="/company-register"
                onClick={(e) => handleNavigation(e, "/company-register")}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase tracking-wider text-xs py-2.5 px-3 text-center rounded flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>REGISTER YOUR COMPANY</span>
              </Link>
            )}

            {/* Mobile Structured Navigation Groups */}
            <div className="space-y-5">
              <div>
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2 mb-2 border-b border-white/10 pb-1 flex items-center gap-1.5">
                  <Home className="w-3 h-3" />
                  <span>CORE NAVIGATION</span>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={(e) => handleNavigation(e, "/")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    HOME
                  </Link>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2 mb-2 border-b border-white/10 pb-1 flex items-center gap-1.5">
                  <Vote className="w-3 h-3" />
                  <span>SOLUTIONS &amp; BALLOTS</span>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/shareholder-e-voting"
                    onClick={(e) => handleNavigation(e, "/shareholder-e-voting")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    SHAREHOLDER E-VOTING (RULE 20)
                  </Link>
                  <Link
                    to="/agm-voting"
                    onClick={(e) => handleNavigation(e, "/agm-voting")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    AGM GENERAL MEETINGS (SEC 108)
                  </Link>
                  <Link
                    to="/egm-voting"
                    onClick={(e) => handleNavigation(e, "/egm-voting")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    EGM SPECIAL RESOLUTIONS
                  </Link>
                  <Link
                    to="/proxy-voting"
                    onClick={(e) => handleNavigation(e, "/proxy-voting")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    PROXY LODGMENT (FORM MGT-11)
                  </Link>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2 mb-2 border-b border-white/10 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SERVICES &amp; GOVERNANCE</span>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/scrutinizer-tools"
                    onClick={(e) => handleNavigation(e, "/scrutinizer-tools")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    SCRUTINIZER AUDIT SUITE
                  </Link>
                  <Link
                    to="/corporate-voting"
                    onClick={(e) => handleNavigation(e, "/corporate-voting")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    CORPORATE GOVERNANCE
                  </Link>
                  <Link
                    to="/live-demo"
                    onClick={(e) => handleNavigation(e, "/live-demo")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    INTERACTIVE SANDBOX DEMO
                  </Link>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-2 mb-2 border-b border-white/10 pb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>COMPLIANCE &amp; SUPPORT</span>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/regulatory-framework"
                    onClick={(e) => handleNavigation(e, "/regulatory-framework")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    REGULATORY FRAMEWORK (SEBI/MCA)
                  </Link>
                  <Link
                    to="/security"
                    onClick={(e) => handleNavigation(e, "/security")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    SECURITY &amp; MERKLE PROOF
                  </Link>
                  <Link
                    to="/compliance"
                    onClick={(e) => handleNavigation(e, "/compliance")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    STATUTORY COMPLIANCE HUB
                  </Link>
                  <Link
                    to="/blog"
                    onClick={(e) => handleNavigation(e, "/blog")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    INSIGHTS &amp; STATUTORY GUIDES
                  </Link>
                  <Link
                    to="/about"
                    onClick={(e) => handleNavigation(e, "/about")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    ABOUT PLATFORM
                  </Link>
                  <Link
                    to="/contact"
                    onClick={(e) => handleNavigation(e, "/contact")}
                    className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-cyan-400 hover:text-cyan-300 rounded hover:bg-white/[0.05]"
                  >
                    INVESTOR HELPDESK &amp; CONTACT
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 pb-6 border-t border-white/10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            VOTE SECURE • MCA SECTION 108 &amp; SEBI LODR REG 44
          </div>
        </div>
      )}

      {/* ─── SAFETY ALERT FOR LEAVING PROTECTED PORTAL ─── */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="bg-[#020817] border-white/15 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-wide text-sm">
              LEAVE SECURE PORTAL?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs">
              You are currently logged into an active administrative or voting session. Navigating away will terminate your active session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPendingPath(null)}
              className="bg-transparent border-white/20 hover:bg-white/10 text-white rounded text-xs uppercase font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmNavigation}
              className="bg-red-600 hover:bg-red-700 text-white border-0 rounded text-xs uppercase font-bold"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout &amp; Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
