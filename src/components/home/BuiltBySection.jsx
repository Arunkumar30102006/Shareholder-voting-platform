import { Code2, Rocket, Sparkles, ExternalLink, Shield } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const techStack = [
    { name: "React 18", color: "from-cyan-500 to-blue-500" },
    { name: "TypeScript", color: "from-blue-600 to-blue-400" },
    { name: "Supabase", color: "from-emerald-500 to-green-400" },
    { name: "Vite", color: "from-purple-500 to-violet-400" },
    { name: "TailwindCSS", color: "from-cyan-400 to-teal-400" },
    { name: "Framer Motion", color: "from-pink-500 to-rose-400" },
    { name: "PostgreSQL", color: "from-blue-500 to-indigo-500" },
    { name: "Zod", color: "from-orange-500 to-amber-400" },
];
const BuiltBySection = () => {
    return (<section className="py-20 md:py-28 relative overflow-hidden bg-transparent">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]"/>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 shadow-sm">
              <Code2 className="w-4 h-4 text-emerald-400"/>
              <span>Open & Transparent</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Built with{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Transparency
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              This platform is an enterprise-grade solution demonstrating how modern technology
              can transform corporate governance in India.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Project Story Card */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="p-8 rounded-2xl bg-[#0d1b2a]/40 backdrop-blur-xl border border-white/10 shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-5">
                  <Rocket className="w-6 h-6 text-primary"/>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Why We Built This</h3>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  India's corporate governance ecosystem still relies on fragmented, outdated e-voting solutions.
                  We set out to build a modern, developer-friendly platform that prioritizes security, transparency,
                  and user experience — proving that SEBI-compliant e-voting can be elegant and accessible.
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <Sparkles className="w-4 h-4"/>
                  <span>Enterprise Ready · Actively Developed · Production Grade</span>
                </div>
              </div>
            </motion.div>

            {/* Developer Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="p-8 rounded-2xl bg-[#0d1b2a]/40 backdrop-blur-xl border border-white/10 shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-5">
                  <Shield className="w-6 h-6 text-secondary"/>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Enterprise Architecture</h3>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  Developed as a comprehensive platform addressing the intersection of financial technology,
                  corporate law compliance, and modern web architecture. Built from the ground up with
                  production-grade security patterns and real-world regulatory awareness.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Link to="/about">
                    <Button variant="outline" size="sm" className="gap-2 text-xs border-white/10 hover:bg-white/5">
                      <ExternalLink className="w-3 h-3"/>
                      Learn About Our Platform
                    </Button>
                  </Link>
                  <Link to="/security">
                    <Button variant="outline" size="sm" className="gap-2 text-xs border-white/10 hover:bg-white/5">
                      <Shield className="w-3 h-3"/>
                      Security Architecture
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center">
            <p className="text-sm text-slate-300 mb-5 font-medium uppercase tracking-wider">
              Built With Modern Technology
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (<motion.div key={tech.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 * index }} className="group relative">
                  <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-white/90 font-medium hover:bg-white/10 transition-all cursor-default">
                    <span className={`bg-gradient-to-r ${tech.color} bg-clip-text text-transparent`}>
                      {tech.name}
                    </span>
                  </div>
                </motion.div>))}
            </div>
          </motion.div>

          {/* Independence Disclaimer Badge */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-slate-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/>
              <span>
                Independent technology platform — not affiliated with NSDL, CDSL, or SEBI
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);
};
export default BuiltBySection;
