import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Vote, FileText, Users, ShieldCheck, Link2, ArrowRight, Layers, Lock, Sparkles } from "lucide-react";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" }
]);
const services = [
    {
        icon: Vote,
        title: "Global E-Voting for AGMs & EGMs",
        description: "High-concurrency, real-time electronic balloting infrastructure engineered for general meetings, special assemblies, and proxy voting. Enables seamless cross-border participation with instant weighted tabulation.",
    },
    {
        icon: FileText,
        title: "Notice & Proxy Ballot Dispatch",
        description: "Automated distribution of AGM/EGM notices, explanatory statements, and encrypted voting credentials via email and SMS with delivery verification tracking.",
    },
    {
        icon: Users,
        title: "Director & Nominee Elections",
        description: "Dedicated director candidate balloting modules with strict single-vote enforcement, candidate biographies, experience profiles, and live quorum tracking.",
    },
    {
        icon: ShieldCheck,
        title: "Scrutinizer Audit & Official PDF Reporting",
        description: "Generate 1-click boardroom-grade Scrutinizer Audit PDF reports with full statutory motion breakdowns, quorum attestation, and formal witness sign-off blocks.",
    },
    {
        icon: Link2,
        title: "Global Transfer Agent (RTA) Integration",
        description: "High-speed API and CSV roster ingestion compatible with leading global share registrars, depository systems, and corporate cap table managers.",
    },
    {
        icon: Lock,
        title: "Virtual Meeting Stream Suite",
        description: "Built-in virtual room dispatching with Zoom, Microsoft Teams, Google Meet, and Cisco Webex integration with live credential verification.",
    },
];
const Services = () => {
    return (<div className="min-h-screen pt-24 pb-20 bg-[#020817] text-white">
      <SEO title="Services | Corporate Shareholder E-Voting Solutions" description="Comprehensive e-voting services for companies: AGM/EGM voting, scrutinizer audit reporting, notice dispatching, and share transfer agent integration." canonical="/services" schemas={[breadcrumbSchema]}/>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Layers className="w-3.5 h-3.5"/>
            Comprehensive Governance Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
            Enterprise Solutions for <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Corporate Governance</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed">
            Enterprise-grade electronic voting and shareholder meeting management tools tailored for complex global capital markets and regulatory jurisdictions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (<div key={index} className="bg-[#0d1b2a]/90 backdrop-blur-xl border border-white/15 p-8 rounded-3xl flex flex-col h-full hover:border-cyan-400/40 transition-all shadow-xl hover:shadow-cyan-950/30">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-6 text-cyan-300 shrink-0">
                <service.icon className="w-7 h-7"/>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-slate-200 text-sm font-normal leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>
              <Link to="/contact">
                <Button variant="ghost" className="group text-cyan-300 hover:text-white hover:bg-white/10 w-full justify-between font-bold rounded-xl text-xs">
                  Request Solution Brief
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </Button>
              </Link>
            </div>))}
        </div>

        {/* Custom Solution Callout */}
        <div className="mt-20 bg-gradient-to-r from-blue-950/80 via-[#0d1b2a] to-cyan-950/80 border border-blue-400/30 rounded-3xl p-10 md:p-12 text-center shadow-2xl">
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-4"/>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Require a Tailored Enterprise Deployment?</h2>
          <p className="text-slate-200 text-sm md:text-base mb-8 max-w-2xl mx-auto font-normal leading-relaxed">
            Our platform can be white-labeled, integrated with custom enterprise identity providers (SSO/SAML), and connected directly to your transfer agent infrastructure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-500/20">
                Speak With Enterprise Sales
              </Button>
            </Link>
            <Link to="/company-register">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white font-bold rounded-xl px-8">
                Deploy Instant General Meeting
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>);
};
export default Services;
