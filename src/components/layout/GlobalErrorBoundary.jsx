import React, { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/services/logger";
class GlobalErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        logger.error("Uncaught error in application", { error, errorInfo });
        const errStr = error?.message || "";
        if (errStr.includes("Failed to fetch dynamically imported module") ||
            errStr.includes("Importing a module script failed") ||
            errStr.includes("error loading dynamically imported module")) {
            const reloadKey = "boundary_chunk_retry";
            const lastReload = sessionStorage.getItem(reloadKey);
            const now = Date.now();
            if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                sessionStorage.setItem(reloadKey, String(now));
                window.location.reload();
            }
        }
    }
    handleReload = () => {
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            return (<div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-card border border-border shadow-2xl">
                        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-destructive"/>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                We apologize for the inconvenience. A critical error has occurred.
                            </p>
                        </div>

                        {this.state.error && import.meta.env.DEV && (<div className="text-left p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-40 border border-border/50">
                                {this.state.error.toString()}
                            </div>)}

                        <Button onClick={this.handleReload} className="w-full gap-2 items-center" size="lg">
                            <RefreshCw className="w-4 h-4"/>
                            Reload Application
                        </Button>
                    </div>
                </div>);
        }
        return this.props.children;
    }
}
export default GlobalErrorBoundary;
