// In-memory session and CSRF token state for authenticated shareholder voting

interface SessionState {
  csrfToken: string | null;
  shareholder: {
    id: string;
    name: string;
    company_id: string;
    session_id: string | null;
    shares_held: number;
    folio_number: string | null;
    demat_account_number: string | null;
  } | null;
}

const state: SessionState = {
  csrfToken: null,
  shareholder: null,
};

const listeners = new Set<() => void>();

export const authSession = {
  getCsrfToken(): string | null {
    return state.csrfToken;
  },

  getShareholder() {
    return state.shareholder;
  },

  setSession(csrfToken: string, shareholder: SessionState["shareholder"]) {
    state.csrfToken = csrfToken;
    state.shareholder = shareholder;
    listeners.forEach((l) => l());
  },

  clearSession() {
    state.csrfToken = null;
    state.shareholder = null;
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
