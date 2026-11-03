/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-medium hover:-translate-y-0.5",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-medium hover:-translate-y-0.5",
            ghost: "hover:bg-muted hover:text-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            hero: "bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-large hover:shadow-glow hover:-translate-y-1",
            accent: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-medium hover:-translate-y-0.5",
            saffron: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-medium hover:shadow-glow hover:-translate-y-0.5",
            glass: "bg-card/60 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card/80 hover:shadow-medium",
        },
        size: {
            default: "h-11 px-6 py-2",
            sm: "h-9 rounded-lg px-4 text-xs",
            lg: "h-14 rounded-2xl px-8 text-base",
            xl: "h-16 rounded-2xl px-10 text-lg",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>;
});
Button.displayName = "Button";
export { Button, buttonVariants };
