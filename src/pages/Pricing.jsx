import { CheckCircle2, ArrowRight, Sparkles, Building2, Users, Shield, HelpCircle } from "lucide-react";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Pricing", url: "/pricing" }
]);
const tiers = [
    {
        name: "Starter",
        description: "For small companies conducting their first e-voting sessions.",
        price: "Contact Us",
        highlight: false,
        features: [
            "Up to 500 shareholders",
            "1 voting session per month",
            "Email credential delivery",
            "Basic reporting (PDF)",
            "Standard encryption",
            "Email support",
        ],
        cta: "Get Started",
        ctaLink: "/contact",
        icon: Users,
        color: "from-slate-500 to-slate-400",
    },
    {
        name: "Professional",
        description: "For growing companies with regular AGMs and shareholder engagement needs.",
        price: "Contact Us",
        highlight: true,
        features: [
            "Up to 10,000 shareholders",
            "Unlimited voting sessions",
            "Email + OTP authentication",
            "Scrutinizer reports with audit trails",
            "AI-powered analytics suite",
            "Multi-language support",
            "Priority email & phone support",
            "Custom branding",
        ],
        cta: "Contact Sales",
        ctaLink: "/contact",
        icon: Building2,
        color: "from-blue-500 to-cyan-500",
    },
    {
        name: "Enterprise",
        description: "For large corporations requiring full compliance and customization.",
        price: "Custom",
        highlight: false,
        features: [
            "Unlimited shareholders",
            "Unlimited voting sessions",
            "Advanced multi-factor auth",
            "Full SEBI LODR compliance suite",
            "Dedicated scrutinizer portal",
            "White-label platform option",
            "API access & integrations",
            "Dedicated account manager",
            "SLA with 99.9% uptime guarantee",
            "On-premise deployment option",
        ],
        cta: "Talk to Us",
        ctaLink: "/contact",
        icon: Shield,
        color: "from-purple-500 to-violet-500",
    },
];
const faqs = [
    {
        q: "What's included in each plan?",
        a: "Every plan includes our core statutory e-voting engine aligned with Section 108 and SEBI LODR Regulation 44, featuring SHA-256 ballot hashing, shareholder 2FA authentication, and official Form MGT-13 style PDF reporting. Higher-tier plans add features like unlimited voting sessions, AI-powered analytics, multi-language support, custom branding, and dedicated account management.",
    },
    {
        q: "How does the platform align with SEBI & MCA statutory guidelines?",
        a: "Our platform is architecturally engineered in accordance with Companies Act 2013 (Section 108), Rule 20 of the Companies (Management and Administration) Rules, 2014, and SEBI (LODR) Regulations 2015 (Regulation 44). We maintain complete cryptographic audit trails and support two-witness independent Scrutinizer access. See our compliance page for our full transparency matrix.",
    },
    {
        q: "Is there a free trial?",
        a: "Yes — you can register your company and explore the platform features at no cost. Contact us to discuss pricing for production voting sessions.",
    },
    {
        q: "Can I upgrade or cancel anytime?",
        a: "Absolutely. You can upgrade your plan at any time and your existing data, configurations, and historical records will be fully preserved. For cancellations, we offer a hassle-free offboarding process with complete data export.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers (NEFT/RTGS), UPI, and standard payment gateways. Enterprise clients can request monthly or annual invoicing with NET-30 terms.",
    },
];
const Pricing = () => {
    const pricingFaqSchema = createFaqSchema(faqs.map(f => ({ question: f.q, answer: f.a })));
    return (<div className="min-h-screen relative">
      <SEO title="Pricing Plans | Vote India Secure Shareholder E-Voting" description="Explore transparent pricing options for conducting shareholder e-voting, AGMs, EGMs, and postal ballots on Vote India Secure." canonical="/pricing" schemas={[breadcrumbSchema, pricingFaqSchema]}/>
      <main className="container mx-auto px-4 pt-28 pb-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center space-y-4 md:space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400"/>
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Plans for{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                Every Organization
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Choose a plan that fits your organization's size and governance needs.
              All plans include enterprise-grade security and SEBI compliance foundations.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">
            {tiers.map((tier, index) => (<motion.div key={tier.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`relative rounded-2xl p-8 border backdrop-blur-xl shadow-2xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 ${tier.highlight
                ? "bg-[#0d1b2a]/60 border-primary/40 ring-1 ring-primary/20"
                : "bg-[#0d1b2a]/40 border-white/10"}`}>
                {tier.highlight && (<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"/>)}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

                <div className="relative z-10">
                  {/* Icon & Title */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg mb-5`}>
                    <tier.icon className="w-6 h-6 text-white"/>
                  </div>

                  {tier.highlight && (<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-3">
                      <Sparkles className="w-3 h-3"/>
                      Most Popular
                    </div>)}

                  <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-sm text-slate-200 mb-5">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (<li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"/>
                        <span>{feature}</span>
                      </li>))}
                  </ul>

                  {/* CTA */}
                  <Link to={tier.ctaLink}>
                    <Button variant={tier.highlight ? "hero" : "outline"} className={`w-full gap-2 ${!tier.highlight ? "border-white/10 hover:bg-white/5" : ""}`} size="lg">
                      {tier.cta}
                      <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </Link>
                </div>
              </motion.div>))}
          </div>

          {/* Prototype Notice */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex justify-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-slate-200 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/>
              <span>
                Pricing tiers are customizable based on shareholder roster size and general meeting frequency. Contact us for enterprise quotes.
              </span>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-200">
                Common questions about pricing and plans.
              </p>
            </div>
            <div className="grid gap-4">
              {faqs.map((faq, index) => (<motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.05 }} className="p-6 rounded-2xl bg-[#0d1b2a]/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0"/>
                    {faq.q}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </motion.div>))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>);
};
export default Pricing;
