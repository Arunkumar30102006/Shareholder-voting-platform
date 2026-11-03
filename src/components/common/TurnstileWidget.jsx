import React, { forwardRef, useEffect } from "react";

// Cloudflare Turnstile disabled across project
export const TurnstileWidget = forwardRef(({ onSuccess, className = "" }, ref) => {
    useEffect(() => {
        onSuccess?.("disabled");
    }, [onSuccess]);

    return null;
});

TurnstileWidget.displayName = "TurnstileWidget";
export default TurnstileWidget;
