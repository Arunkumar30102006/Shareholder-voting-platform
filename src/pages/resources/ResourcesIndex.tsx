import { Link } from "react-router-dom";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { RESOURCE_ARTICLES } from "./articlesData";
import { BookOpen, ArrowRight, Clock, Calendar, Scale, ShieldCheck } from "lucide-react";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Resources", url: "/resources" }
]);

export default function ResourcesIndex() {
  const articles = Object.values(RESOURCE_ARTICLES);

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Shareholder E-Voting Resources & Guides | Vote India Secure"
        description="Statutory guides, operational walkthroughs, and legal analyses for corporate secretarial teams, scrutinizers, and institutional shareholders."
        canonical="/resources"
        schemas={[breadcrumbSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Corporate Governance Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Statutory E-Voting{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
              Knowledge Base &amp; Resources
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Authoritative, in-depth legal analyses, operational timelines, and mathematical formulas governing corporate shareholder balloting in India.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 bg-[#0d1b2a]/40 border-y border-white/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 font-semibold">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" /> {article.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    <Link to={`/resources/${article.slug}`}>
                      {article.h1}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> Reviewed: {article.lastReviewedDate}
                  </span>
                  <Link
                    to={`/resources/${article.slug}`}
                    className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1"
                  >
                    Read Guide <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Tools Cross-Link Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Explore Corporate Voting Solutions</h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto mb-8">
            Our platform provides enterprise-grade infrastructure engineered specifically around these statutory workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shareholder-e-voting">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 inline-block transition-all">
                Shareholder E-Voting →
              </span>
            </Link>
            <Link to="/agm-voting">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 inline-block transition-all">
                AGM E-Voting →
              </span>
            </Link>
            <Link to="/egm-voting">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 inline-block transition-all">
                EGM E-Voting →
              </span>
            </Link>
            <Link to="/proxy-voting">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 inline-block transition-all">
                Proxy Voting →
              </span>
            </Link>
            <Link to="/scrutinizer-tools">
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 inline-block transition-all">
                Scrutinizer Tools →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
