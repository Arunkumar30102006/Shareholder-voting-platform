/* eslint-disable react-refresh/only-export-components */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SafeClientWidgets from "./components/layout/SafeClientWidgets";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";

import GlobalErrorBoundary from "./components/layout/GlobalErrorBoundary";
import "./i18n/config"; // Initialize i18n

import ProtectedAdminRoute from "@/components/auth/ProtectedAdminRoute";

import type { RouteRecord } from 'vite-react-ssg';

// Configure Global Query Client with aggressive caching (User Requested)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Helper: react-router `lazy` expects `{ Component }` but our pages use `export default`.
 * This maps `{ default: Comp }` → `{ Component: Comp }`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyPage = (importFn: () => Promise<any>) => {
  return async () => {
    try {
      const mod = await importFn();
      return { Component: mod.default };
    } catch (err: unknown) {
      const errStr = String(err);
      if (
        errStr.includes("Failed to fetch dynamically imported module") ||
        errStr.includes("Importing a module script failed") ||
        errStr.includes("error loading dynamically imported module")
      ) {
        if (typeof window !== "undefined") {
          const reloadKey = "app_chunk_retry";
          const lastReload = sessionStorage.getItem(reloadKey);
          const now = Date.now();
          if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
            sessionStorage.setItem(reloadKey, String(now));
            window.location.reload();
            return { Component: () => null };
          }
        }
      }
      throw err;
    }
  };
};

/**
 * RootLayout — wraps the entire route tree with all providers.
 * vite-react-ssg manages the router, so no BrowserRouter here.
 * Providers that were previously inside <BrowserRouter> now live here.
 */
const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <GlobalErrorBoundary>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ScrollToTop />

            {/* Post-hydration safe floating widgets */}
            <SafeClientWidgets />

            <div className="flex flex-col min-h-screen">
              <Navbar />

              <main className="flex-grow">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                  <Outlet />
                </Suspense>
              </main>

              <Footer />
            </div>
          </TooltipProvider>
        </GlobalErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Route configuration as a data array for vite-react-ssg.
 * All routes are children of the RootLayout route so they inherit providers.
 * Using eager Index for instant home hydration and `lazy` for all secondary routes.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ─── Home (Eager for zero-suspense instant hydration) ───
      { index: true, element: <Index /> },

      // ─── Auth / Dashboard Routes ───
      { path: 'company-register', lazy: lazyPage(() => import('./pages/CompanyRegister')) },
      { path: 'company-login', lazy: lazyPage(() => import('./pages/CompanyLogin')) },
      { path: 'shareholder-login', lazy: lazyPage(() => import('./pages/ShareholderLogin')) },
      { path: 'voting-dashboard', lazy: lazyPage(() => import('./pages/VotingDashboard')) },
      { path: 'shareholder-analysis', lazy: lazyPage(() => import('./pages/ShareholderAnalysis')) },

      // ─── Protected Admin Routes ───
      {
        element: <ProtectedAdminRoute />,
        children: [
          { path: 'company-dashboard', lazy: lazyPage(() => import('./pages/CompanyDashboard')) },
          { path: 'voting-management', lazy: lazyPage(() => import('./pages/VotingManagement')) },
          { path: 'ai-power-suite', lazy: lazyPage(() => import('./pages/AIPowerSuite')) },
        ],
      },

      // ─── Public Pages & SEO Landing Pages ───
      { path: 'about', lazy: lazyPage(() => import('./pages/About')) },
      { path: 'features', lazy: lazyPage(() => import('./pages/Features')) },
      { path: 'pricing', lazy: lazyPage(() => import('./pages/Pricing')) },
      { path: 'demo', lazy: lazyPage(() => import('./pages/Demo')) },
      { path: 'live-demo', lazy: lazyPage(() => import('./pages/LiveDemo')) },
      { path: 'services', lazy: lazyPage(() => import('./pages/Services')) },
      { path: 'compliance', lazy: lazyPage(() => import('./pages/Compliance')) },
      { path: 'security', lazy: lazyPage(() => import('./pages/Security')) },
      { path: 'shareholder-voting', lazy: lazyPage(() => import('./pages/seo/ShareholderVoting')) },
      { path: 'shareholder-e-voting', lazy: lazyPage(() => import('./pages/seo/ShareholderVoting')) },
      { path: 'online-e-voting', lazy: lazyPage(() => import('./pages/seo/OnlineEVoting')) },
      { path: 'remote-e-voting', lazy: lazyPage(() => import('./pages/seo/RemoteEVoting')) },
      { path: 'agm-voting', lazy: lazyPage(() => import('./pages/seo/AgmVoting')) },
      { path: 'egm-voting', lazy: lazyPage(() => import('./pages/seo/EgmVoting')) },
      { path: 'corporate-voting', lazy: lazyPage(() => import('./pages/seo/CorporateVoting')) },
      { path: 'proxy-voting', lazy: lazyPage(() => import('./pages/seo/ProxyVoting')) },
      { path: 'scrutinizer-tools', lazy: lazyPage(() => import('./pages/seo/ScrutinizerTools')) },
      { path: 'secure-voting', lazy: lazyPage(() => import('./pages/seo/SecureVoting')) },
      { path: 'how-it-works', lazy: lazyPage(() => import('./pages/seo/HowItWorks')) },
      { path: 'faqs', lazy: lazyPage(() => import('./pages/Faqs')) },
      { path: 'resources', lazy: lazyPage(() => import('./pages/resources/ResourcesIndex')) },
      { path: 'resources/:slug', lazy: lazyPage(() => import('./pages/resources/ResourceArticle')) },
      { path: 'blog', lazy: lazyPage(() => import('./pages/Blog')) },
      { path: 'blog/sebi-compliant-evoting-guide', lazy: lazyPage(() => import('./pages/blog/SebiCompliantEvotingGuide')) },
      { path: 'blog/how-online-shareholder-voting-works', lazy: lazyPage(() => import('./pages/blog/HowOnlineShareholderVotingWorks')) },
      { path: 'blog/agm-evoting-vs-physical-meeting', lazy: lazyPage(() => import('./pages/blog/AgmEvotingVsPhysicalMeeting')) },
      { path: 'blog/benefits-electronic-voting-shareholders', lazy: lazyPage(() => import('./pages/blog/BenefitsElectronicVotingShareholders')) },
      { path: 'blog/role-of-scrutinizer-form-mgt-13', lazy: lazyPage(() => import('./pages/blog/RoleOfScrutinizerFormMgt13')) },
      { path: 'blog/agm-remote-evoting-timeline-checklist', lazy: lazyPage(() => import('./pages/blog/AgmRemoteEvotingTimelineChecklist')) },
      { path: 'contact', lazy: lazyPage(() => import('./pages/Contact')) },

      // ─── Legal Routes ───
      { path: 'privacy-policy', lazy: lazyPage(() => import('./pages/legal/PrivacyPolicy')) },
      { path: 'terms-of-service', lazy: lazyPage(() => import('./pages/legal/TermsOfService')) },
      { path: 'sebi-compliance', lazy: lazyPage(() => import('./pages/legal/SebiCompliance')) },
      { path: 'regulatory-framework', lazy: lazyPage(() => import('./pages/legal/RegulatoryFramework')) },
      { path: 'data-protection', lazy: lazyPage(() => import('./pages/legal/DataProtection')) },

      // ─── Catch-all 404 ───
      { path: '*', lazy: lazyPage(() => import('./pages/NotFound')) },
    ],
  },
];

