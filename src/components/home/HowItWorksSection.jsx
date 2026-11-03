import { Building2, Users, Vote, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
const steps = [
    {
        step: 1,
        icon: Building2,
        title: "Company Registers",
        description: "Company signs up and creates an AGM/EGM voting event with resolutions, cut-off dates, and shareholder lists.",
        color: "from-blue-500 to-cyan-500",
    },
    {
        step: 2,
        icon: Users,
        title: "Shareholders Authenticate",
        description: "Shareholders verify their identity through PAN + DPID/Client ID verification with OTP-based two-factor authentication.",
        color: "from-amber-500 to-orange-500",
    },
    {
        step: 3,
        icon: Vote,
        title: "Votes Cast & Counted",
        description: "Votes are encrypted, recorded on an immutable ledger, and results are calculated in real-time with full audit trails.",
        color: "from-emerald-500 to-teal-500",
    },
];
const HowItWorksSection = () => {
    return (<section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 shadow-sm">
            <Vote className="w-4 h-4 text-purple-400"/>
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From company registration to verified results — secure e-voting in three simple steps.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden lg:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/50 via-amber-500/50 to-emerald-500/50 z-0"/>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (<motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }} className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 ring-4 ring-[#0d1b2a]`}>
                    <step.icon className="w-7 h-7 text-white"/>
                  </div>

                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0d1b2a] border-2 border-white/20 flex items-center justify-center z-20">
                    <span className="text-[10px] font-bold text-white">{step.step}</span>
                  </div>

                  <div className="bg-[#0d1b2a]/40 backdrop-blur-md rounded-2xl p-6 shadow-soft border border-white/10 hover:shadow-large hover:border-white/20 transition-all duration-500 w-full">
                    <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (<div className="hidden lg:flex absolute top-8 -right-4 z-20">
                    <div className="w-8 h-8 rounded-full bg-[#0d1b2a] shadow-md flex items-center justify-center border border-white/10">
                      <ArrowRight className="w-4 h-4 text-secondary"/>
                    </div>
                  </div>)}
              </motion.div>))}
          </div>
        </div>
      </div>
    </section>);
};
export default HowItWorksSection;
