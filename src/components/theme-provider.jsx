/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
const initialState = {
    theme: "system",
    setTheme: () => null,
};
const ThemeProviderContext = createContext(initialState);
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
    const [theme, setTheme] = useState(defaultTheme);
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                setTheme(stored);
            }
        }
        catch {
            // ignore localStorage unavailable
        }
    }, [storageKey]);
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            return;
        }
        root.classList.add(theme);
    }, [theme]);
    const value = {
        theme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };
    return (<ThemeProviderContext.Provider {...props} value={value}>
            <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange>
                {children}
            </NextThemesProvider>
        </ThemeProviderContext.Provider>);
}
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
