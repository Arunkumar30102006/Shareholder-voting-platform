// Session and CSRF token state for authenticated shareholder voting
const STORAGE_KEY = "vote_shareholder_auth_session";

const loadStoredState = () => {
    try {
        if (typeof window !== "undefined") {
            const raw = window.sessionStorage?.getItem(STORAGE_KEY) || window.localStorage?.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    csrfToken: parsed.csrfToken || null,
                    sessionToken: parsed.sessionToken || null,
                    shareholder: parsed.shareholder || null,
                };
            }
        }
    } catch (e) {
        console.warn("Failed to read auth session from storage:", e);
    }
    return {
        csrfToken: null,
        sessionToken: null,
        shareholder: null,
    };
};

const state = loadStoredState();
const listeners = new Set();

const persistState = () => {
    try {
        if (typeof window !== "undefined") {
            if (state.csrfToken || state.shareholder || state.sessionToken) {
                const serialized = JSON.stringify(state);
                window.sessionStorage?.setItem(STORAGE_KEY, serialized);
                window.localStorage?.setItem(STORAGE_KEY, serialized);
            } else {
                window.sessionStorage?.removeItem(STORAGE_KEY);
                window.localStorage?.removeItem(STORAGE_KEY);
            }
        }
    } catch (e) {
        console.warn("Failed to persist auth session to storage:", e);
    }
};

export const authSession = {
    getCsrfToken() {
        return state.csrfToken;
    },
    getSessionToken() {
        return state.sessionToken;
    },
    getShareholder() {
        return state.shareholder;
    },
    getCurrentShareholder() {
        return state.shareholder;
    },
    setSession(csrfToken, shareholder, sessionToken = null) {
        state.csrfToken = csrfToken;
        if (shareholder) {
            state.shareholder = shareholder;
        }
        if (sessionToken) {
            state.sessionToken = sessionToken;
        }
        persistState();
        listeners.forEach((l) => l());
    },
    clearSession() {
        state.csrfToken = null;
        state.sessionToken = null;
        state.shareholder = null;
        persistState();
        listeners.forEach((l) => l());
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
