import React, { useState, useEffect, Suspense, lazy, Component } from "react";
// Lazy-load floating widgets
const WebsiteFeedback = lazy(() => import("../feedback/WebsiteFeedback"));
const VoteAssistant = lazy(() => import("../ai/VoteAssistant").then((m) => ({ default: m.VoteAssistant })));
const ScrollToTopButton = lazy(() => import("../ScrollToTopButton"));
class WidgetErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.debug("SafeClientWidgets error caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}
/**
 * SafeClientWidgets — mounts client-only floating widgets smoothly
 * after React hydration has completed, preventing hydration mismatch error #421.
 */
export const SafeClientWidgets = () => {
    const [canRender, setCanRender] = useState(false);
    useEffect(() => {
        // Defer rendering until after initial hydration tick
        if (typeof window !== "undefined") {
            if ("requestIdleCallback" in window) {
                const handle = window.requestIdleCallback(() => setCanRender(true), { timeout: 1000 });
                return () => {
                    if ("cancelIdleCallback" in window) {
                        window.cancelIdleCallback(handle);
                    }
                };
            }
            else {
                const timer = setTimeout(() => setCanRender(true), 200);
                return () => clearTimeout(timer);
            }
        }
    }, []);
    if (!canRender) {
        return null;
    }
    return (<WidgetErrorBoundary>
      <Suspense fallback={null}>
        <WebsiteFeedback />
        <VoteAssistant />
        <ScrollToTopButton />
      </Suspense>
    </WidgetErrorBoundary>);
};
export default SafeClientWidgets;
