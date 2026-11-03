import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap-theme.css';
import 'sonner/dist/styles.css';
import './index.css';

// Named export `createRoot` is required — vite-react-ssg's build pipeline
// looks for this exact export name. Using `export default` silently falls
// back to SPA mode with no SSG output.
export const createRoot = ViteReactSSG({ routes }, ({ isClient }) => {
    if (isClient) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        document.documentElement.classList.add('dark');
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
        import('./lib/analyticsLoader').then(({ initAnalyticsIfConsented }) => {
            initAnalyticsIfConsented();
        });
    }
});
