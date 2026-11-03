import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" }
]);
const articles = [
    {
        id: 1,
        slug: "/blog/sebi-compliant-evoting-guide",
        title: "What is SEBI-Compliant E-Voting? A Comprehensive Guide for Indian Companies",
        excerpt: "Understand SEBI e-voting regulations, Companies Act 2013 Section 108 mandates, Rule 20 requirements, and best practices for conducting seamless remote shareholder voting in India.",
        date: "Aug 20, 2026",
        author: "Corporate Compliance Desk",
        category: "Regulatory Compliance",
        readTime: "6 min read",
    },
    {
        id: 2,
        slug: "/blog/role-of-scrutinizer-form-mgt-13",
        title: "Role of Scrutinizer in E-Voting & Form MGT-13: Statutory Guide for Indian Companies",
        excerpt: "Learn the statutory responsibilities of an independent scrutinizer in shareholder e-voting under Rule 20, vault unblocking in presence of 2 witnesses, and how Form MGT-13 reports are compiled.",
        date: "Aug 23, 2026",
        author: "Governance & Compliance Desk",
        category: "Corporate Law & Scrutiny",
        readTime: "7 min read",
    },
    {
        id: 3,
        slug: "/blog/agm-remote-evoting-timeline-checklist",
        title: "Remote E-Voting Timeline for AGM: 30-Day Corporate Secretary Compliance Checklist",
        excerpt: "A definitive 30-day statutory checklist and calendar for Company Secretaries conducting remote e-voting, notice dispatches, cut-off date calculations, and AGM general meetings.",
        date: "Aug 23, 2026",
        author: "Corporate Secretarial Desk",
        category: "AGM Operations",
        readTime: "8 min read",
    },
    {
        id: 4,
        slug: "/blog/how-online-shareholder-voting-works",
        title: "How Cryptographic Shareholder Voting Works: Step-by-Step Architecture",
        excerpt: "A comprehensive technical breakdown of how modern e-voting software operates: from cap table roster ingestion and 2FA OTP verification to live ballot tabulation and SHA-256 hash chaining.",
        date: "Aug 18, 2026",
        author: "Systems Architecture Team",
        category: "Technical Guide",
        readTime: "5 min read",
    },
    {
        id: 5,
        slug: "/blog/agm-evoting-vs-physical-meeting",
        title: "Virtual AGMs vs Traditional In-Person General Meetings: Governance Analysis",
        excerpt: "Compare virtual e-voting vs traditional in-person shareholder assemblies. Discover how Indian enterprises achieve statutory quorum compliance and higher shareholder participation.",
        date: "Aug 16, 2026",
        author: "Governance Research Group",
        category: "Strategic Insights",
        readTime: "7 min read",
    },
    {
        id: 6,
        slug: "/blog/benefits-electronic-voting-shareholders",
        title: "Top 5 Governance Advantages of Electronic Voting for Shareholders & Boards",
        excerpt: "Explore the strategic advantages of implementing an electronic voting platform for AGMs, EGMs, and postal ballots — from cryptographic security to real-time statutory quorum tracking.",
        date: "Aug 14, 2026",
        author: "Executive Editorial Board",
        category: "Corporate Governance",
        readTime: "5 min read",
    },
];
const Blog = () => {
    return (<div className="min-h-screen pt-24 pb-20 bg-[#020817] text-white">
      <SEO title="Blog & Insights | Corporate Governance & E-Voting Intelligence" description="Expert analysis on Indian corporate governance, SEBI LODR Regulation 44, Companies Act Section 108, scrutinizer Form MGT-13 reports, and AGM remote e-voting." canonical="/blog" schemas={[breadcrumbSchema]}/>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <BookOpen className="w-4 h-4"/>
            <span>Governance Intelligence & Insights</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
            Corporate Governance <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Statutory explainers, regulatory guides, and technical insights on electronic general meetings, Section 108 compliance, and corporate voting technology in India.
          </p>
        </div>

        <div className="space-y-6">
          {articles.map((article) => (<div key={article.id} className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-4 hover:border-cyan-400/40 backdrop-blur-xl shadow-xl transition-all group">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 font-bold border border-blue-400/30 uppercase tracking-wider text-[11px]">
                  {article.category}
                </span>
                <span className="text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400"/> {article.date}
                </span>
                <span className="text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400"/> {article.author}
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  • {article.readTime}
                </span>
              </div>
              
              <Link to={article.slug}>
                <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </h2>
              </Link>
              
              <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">
                {article.excerpt}
              </p>

              <div className="pt-2">
                <Link to={article.slug} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm group/link">
                  Read Full Regulatory Guide
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"/>
                </Link>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
};
export default Blog;
