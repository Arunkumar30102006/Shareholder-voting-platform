import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BlurText from "@/components/ui/BlurText";
import { ArrowRight, CheckCircle2, ShieldCheck, Play, Eye } from "lucide-react";
import { motion } from "motion/react";
import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
const HeroSection = () => {
    const { t } = useTranslation();
    const features = [
        "End-to-End Encryption",
        "SEBI Aligned Architecture",
        "Tamper-Evident Audit Trails",
        "Two-Factor Authentication",
    ];
    return (<section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#020817]">
      {/* Dynamic Glowing Background Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"/>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}/>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-cyan-600/15 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}/>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block animate-fade-in bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6 shadow-sm">
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400"/>
                Secure. Compliant. Transparent.
              </span>
            </div>

            <div className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight flex flex-col items-center gap-2">
              <BlurText text={t("hero_title_1")} className="text-foreground text-center" delay={200} animateBy="words" direction="top"/>
              <motion.span initial={{ filter: "blur(10px)", opacity: 0, y: 50 }} animate={{ filter: "blur(0px)", opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 animate-gradient text-center inline-block">
                {t("hero_title_2")}
              </motion.span>
            </div>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-4 leading-relaxed font-light">
              {t("hero_subtitle")}
            </p>

            <p className="text-sm text-slate-400 mb-10 font-medium tracking-wide">
              Engineered for Company Secretaries & Corporate Governance Professionals
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in-up delay-300">
              {features.map((feature, index) => (<div key={feature} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-white/90 shadow-sm transition-all hover:bg-white/10" style={{ animationDelay: `${300 + index * 100}ms` }}>
                  <CheckCircle2 className="w-4 h-4 text-green-400"/>
                  <span>{feature}</span>
                </div>))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              <Link to="/live-demo" onClick={() => trackEvent(AnalyticsEvents.REGISTER_CLICK, { location: "hero" })}>
                <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/20">
                  <Play className="w-5 h-5"/>
                  Explore Live Demo
                  <ArrowRight className="w-5 h-5"/>
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2 border-white/20 hover:bg-white/5">
                  <Eye className="w-5 h-5"/>
                  View Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>);
};
export default HeroSection;
