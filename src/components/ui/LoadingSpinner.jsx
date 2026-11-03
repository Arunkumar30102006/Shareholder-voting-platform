import React from 'react';
import { Loader2 } from 'lucide-react';
const LoadingSpinner = () => {
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm transition-all duration-500">
      <div className="relative flex items-center justify-center">
        {/* Animated Glow Background */}
        <div className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>

        {/* Outer Rotating Ring */}
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/10"></div>

        {/* Inner Counter-Rotating Ring */}
        <div className="absolute w-10 h-10 border-2 border-dashed border-secondary/40 border-b-secondary rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>

        {/* Center Pulsing Dot */}
        <div className="absolute">
          <div className="w-2 h-2 bg-saffron-500 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
          Vote India Secure
        </h3>
        <p className="text-sm text-muted-foreground/80 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin"/>
          Loading secure environment...
        </p>
      </div>
    </div>);
};
export default LoadingSpinner;
