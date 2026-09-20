import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'
import './index.css'

// Named export `createRoot` is required — vite-react-ssg's build pipeline
// looks for this exact export name. Using `export default` silently falls
// back to SPA mode with no SSG output.
export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    if (isClient) {
      import('./lib/analyticsLoader').then(({ initAnalyticsIfConsented }) => {
        initAnalyticsIfConsented();
      });
    }
  },
)
