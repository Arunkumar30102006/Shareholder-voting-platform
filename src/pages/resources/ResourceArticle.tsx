import { useParams, Link, Navigate } from "react-router-dom";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { RESOURCE_ARTICLES } from "./articlesData";
import { BookOpen, Calendar, Clock, Scale, ArrowRight, ArrowLeft } from "lucide-react";

export default function ResourceArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? RESOURCE_ARTICLES[slug] : undefined;

  if (!article) {
    return <Navigate to="/resources" replace />;
  }

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Resources", url: "/resources" },
    { name: article.h1, url: `/resources/${article.slug}` }
  ]);

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title={article.title}
        description={article.metaDescription}
        canonical={`/resources/${article.slug}`}
        type="article"
        schemas={[breadcrumbSchema]}
      />

      {/* Article Header */}
      <article className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Base
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                {article.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {article.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Reviewed: {article.lastReviewedDate}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              {article.h1}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal p-6 rounded-2xl bg-[#0d1b2a]/80 border border-white/10">
              {article.summary}
            </p>
          </div>

          {/* Article Body */}
          <div className="prose prose-invert prose-blue max-w-none space-y-10">
            {article.sections.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-3">
                  {sec.heading}
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {sec.content}
                </p>
                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-300">
                    {sec.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bp}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Versioned Statutory Attribution Card */}
          <section className="mt-16 pt-8 border-t border-white/10">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                Statutory Attribution &amp; Review Metadata
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Primary Statutory Source</dt>
                  <dd className="text-slate-200 font-semibold">{article.statutorySource}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Statutory Version</dt>
                  <dd className="text-slate-200 font-semibold">{article.statutoryVersion}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Last Content Review Date</dt>
                  <dd className="text-slate-200 font-semibold">{article.lastReviewedDate}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Review Committee</dt>
                  <dd className="text-slate-200 font-semibold">{article.reviewer}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Related Links & Solutions */}
          {article.relatedLinks && article.relatedLinks.length > 0 && (
            <section className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-base font-bold text-white mb-4">Related Solutions &amp; Guides</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {article.relatedLinks.map((rl, rIdx) => (
                  <Link
                    key={rIdx}
                    to={rl.url}
                    className="p-4 rounded-xl bg-[#0d1b2a]/90 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all flex items-center justify-between"
                  >
                    <span>{rl.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
