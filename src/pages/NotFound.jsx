import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Home, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
const NotFound = () => {
    const location = useLocation();
    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);
    return (<div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      <SEO title="404 - Page Not Found | Vote India Secure" description="The requested page could not be found." noindex={true}/>
      {/* Background Orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"/>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }}/>
      </div>

      <div className="text-center px-4 max-w-lg">
        {/* Animated Shield Icon */}
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.8, type: "spring", bounce: 0.4 }} className="mx-auto mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"/>
            <div className="relative w-24 h-24 bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-primary"/>
            </div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <h1 className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary via-amber-400 to-orange-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-sm md:text-base text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
            The page <code className="text-primary/80 bg-white/5 px-2 py-0.5 rounded text-xs">{location.pathname}</code> doesn't exist.
            It may have been moved or you may have followed an incorrect link.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="hero" size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
              <Home className="w-4 h-4"/>
              Return Home
              <ArrowRight className="w-4 h-4"/>
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-white/10 hover:bg-white/5">
              <Mail className="w-4 h-4"/>
              Contact Support
            </Button>
          </Link>
        </motion.div>

        {/* Security Badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            <span>All systems operational — shareholdervoting.in</span>
          </div>
        </motion.div>
      </div>
    </div>);
};
export default NotFound;
