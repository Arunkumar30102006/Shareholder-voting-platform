import { SEO } from "@/components/layout/SEO";
import { createArticleSchema, createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export const BlogArticleLayout = ({ title, description, canonical, author, reviewer = "Governance Research Desk", date, lastUpdated = "August 2026", readTime, category, keywords, sources, children, }) => {
    const articleSchema = createArticleSchema({
        title,
        description,
        url: canonical,
        datePublished: date,
        dateModified: lastUpdated.includes("2026") ? "2026-08-23" : date,
    });
    const breadcrumbSchema = createBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog & Insights", url: "/blog" },
        { name: title, url: canonical }
    ]);
    return (<div className="min-h-screen pt-24 pb-20 bg-[#020817] text-white">
      <SEO title={`${title} | Vote India Secure`} description={description} canonical={canonical} type="article" schemas={[articleSchema, breadcrumbSchema]}/>

      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back to blog */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:underline mb-8 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4"/>
          Back to Blog & Regulatory Insights
        </Link>

        {/* Article header */}
        <header className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 uppercase tracking-wider text-xs font-semibold">
            {category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mt-4 mb-6 text-white leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 border-y border-white/10 py-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <User className="w-4 h-4 text-cyan-400"/> {author}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400"/> Reviewed by {reviewer}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-400"/> Published: {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400"/> {readTime}
            </span>
          </div>
        </header>

        {/* Article content */}
        <div className="prose prose-invert prose-lg max-w-none mb-16 text-slate-200 leading-relaxed font-normal">
          {children}
        </div>

        {/* Authoritative Sources Section */}
        {sources && sources.length > 0 && (<div className="bg-[#0d1b2a]/80 border border-white/15 p-6 sm:p-8 rounded-3xl mb-12 shadow-xl">
            <div className="flex items-center gap-2 text-white font-bold text-base mb-4">
              <FileText className="w-5 h-5 text-cyan-400"/>
              <span>Statutory Sources & References</span>
            </div>
            <ul className="space-y-2">
              {sources.map((src, idx) => (<li key={idx} className="text-xs sm:text-sm text-slate-300">
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1">
                    {src.title} ↗
                  </a>
                </li>))}
            </ul>
          </div>)}

        {/* Contextual CTA */}
        <div className="bg-gradient-to-r from-blue-950/80 via-[#0d1b2a] to-cyan-950/80 border border-blue-400/30 p-8 md:p-10 rounded-3xl text-center shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-3">Modernize Your Shareholder E-Voting</h3>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            Discover how Vote India Secure delivers statutory compliance with Section 108 and SEBI LODR Regulation 44 alongside instant scrutinizer reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/compliance">
              <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white font-semibold">
                View Compliance Matrix
              </Button>
            </Link>
            <Link to="/live-demo">
              <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2">
                Explore Live Demo
                <ArrowRight className="w-4 h-4"/>
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>);
};
export default BlogArticleLayout;
