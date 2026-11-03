import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className = "", type, style = {}, ...props }, ref) => {
    const cls = className || "";

    // Parse specific left/right padding utilities to guarantee icon spacing
    const plMatch = cls.match(/\b(?:pl|ps)-(\d+(?:\.\d+)?)/);
    const prMatch = cls.match(/\b(?:pr|pe)-(\d+(?:\.\d+)?)/);
    const hasP = /\bp-\d+/.test(cls);

    const inlineStyles = { ...style };

    if (plMatch) {
        const val = parseFloat(plMatch[1]);
        inlineStyles.paddingLeft = `${val * 0.25}rem`;
    }
    if (prMatch) {
        const val = parseFloat(prMatch[1]);
        inlineStyles.paddingRight = `${val * 0.25}rem`;
    }

    const defaultPadding = hasP || plMatch || prMatch ? "" : "px-3";

    return (
        <input
            type={type}
            style={inlineStyles}
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                defaultPadding,
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
