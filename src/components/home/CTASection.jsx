import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Shield, CheckCircle2, Play } from "lucide-react";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
const CTASection = () => {
    const { t } = useTranslation();
    const benefits = [
        t("cta_ben_1"),
        t("cta_ben_2"),
        t("cta_ben_3"),
        t("cta_ben_4"),
    ];
    return (<section className="py-20 md:py-32 relative overflow-hidden bg-transparent">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"/>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"/>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-white text-sm font-medium mb-8">
            <Shield className="w-4 h-4 text-orange-400"/>
            <span>{t("cta_badge")}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t("cta_title_part1")}{" "}
            <span className="text-primary">{t("cta_title_part2")}</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("cta_desc")}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit) => (<div key={benefit} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm text-white/90 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400"/>
                <span>{benefit}</span>
              </div>))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/live-demo">
              <Button variant="hero" size="xl" className="gap-3 text-lg px-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <Play className="w-6 h-6"/>
                Try Live Demo
                <ArrowRight className="w-6 h-6"/>
              </Button>
            </Link>
            <Link to="/company-register" onClick={() => trackEvent(AnalyticsEvents.REGISTER_CLICK, { location: 'cta_section' })}>
              <Button variant="outline" size="xl" className="gap-3 text-lg px-10 border-white/20 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300">
                <Building2 className="w-6 h-6"/>
                {t("cta_btn")}
              </Button>
            </Link>
          </div>

          {/* Trust Text */}
          <p className="text-sm text-muted-foreground mt-6">
            {t("cta_trust")}
          </p>
        </div>
      </div>
    </section>);
};
export default CTASection;
