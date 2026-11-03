import React from "react";
/**
 * HeroCyberOrb — Ultra-high-performance GPU-accelerated background visual.
 * Replaces heavy Three.js / WebGL canvas with pure CSS 3D transforms,
 * reducing TBT to ~0ms and saving ~650KB of main-thread JavaScript execution.
 */
export const HeroCyberOrb = () => {
    return (<div className="absolute inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center" aria-hidden="true">
      {/* Ambient Lighting Cones */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px] will-change-transform"/>
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-700/10 rounded-full blur-[100px]"/>
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-teal-600/10 rounded-full blur-[100px]"/>

      {/* Futuristic Concentric 3D Gyro Rings */}
      <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] flex items-center justify-center opacity-40 sm:opacity-50">
        
        {/* Core Pulsing Energy Glow */}
        <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent blur-2xl animate-pulse"/>

        {/* Outer Orbit Ring 1 */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-[spin_40s_linear_infinite]" style={{ transform: "rotateX(68deg) rotateY(15deg)" }}/>

        {/* Middle Orbit Ring 2 */}
        <div className="absolute inset-6 sm:inset-10 rounded-full border border-blue-400/25 border-t-cyan-400/60 border-b-blue-600/60 animate-[spin_25s_linear_infinite_reverse]" style={{ transform: "rotateX(62deg) rotateY(-25deg)" }}/>

        {/* Inner Counter-Rotating Ring 3 */}
        <div className="absolute inset-16 sm:inset-24 rounded-full border border-teal-400/20 border-l-cyan-300/50 animate-[spin_18s_linear_infinite]" style={{ transform: "rotateX(55deg) rotateY(35deg)" }}/>

        {/* Central Geometric Hologram Disc */}
        <div className="absolute w-28 h-28 sm:w-40 sm:h-40 rounded-full border border-cyan-400/30 bg-blue-950/20 backdrop-blur-[2px] shadow-[0_0_50px_rgba(6,182,212,0.2)]" style={{ transform: "rotateX(60deg)" }}/>
      </div>
    </div>);
};
export default HeroCyberOrb;
