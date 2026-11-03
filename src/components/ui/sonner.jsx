/* eslint-disable react-refresh/only-export-components */
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import "sonner/dist/styles.css";

const Toaster = ({ ...props }) => {
    const { theme = "dark" } = useTheme();
    return (
        <Sonner
            theme={theme}
            position="bottom-right"
            richColors
            closeButton
            expand={true}
            visibleToasts={6}
            style={{ zIndex: 999999 }}
            toastOptions={{
                style: {
                    background: "#0d1b2a",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "14px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)",
                    fontSize: "13px",
                    fontWeight: 600,
                    padding: "14px 18px",
                },
                className: "border border-white/20 shadow-2xl",
            }}
            {...props}
        />
    );
};
export { Toaster, toast };
