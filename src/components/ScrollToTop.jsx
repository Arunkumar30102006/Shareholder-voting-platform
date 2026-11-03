import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        // Disable browser's default scroll restoration to handle it manually
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        if (hash) {
            // Small delay to ensure DOM is ready for hash scrolling
            setTimeout(() => {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 0);
        }
        else {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);
    return null;
};
export default ScrollToTop;
