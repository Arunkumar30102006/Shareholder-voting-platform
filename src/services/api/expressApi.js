/**
 * ============================================================================
 * EXPRESS BACKEND API CLIENT
 * Connects frontend directly to Node.js / Express Backend (port 5000)
 * ============================================================================
 */

const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const expressCompanyApi = {
  // Register Company + Admin
  register: (formData) =>
    request("/companies/register", {
      method: "POST",
      body: JSON.stringify({ formData }),
    }),

  // Admin Login
  login: (email, password) =>
    request("/companies/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Get Company Profile
  getProfile: (companyId) =>
    request(`/companies/${companyId}`, {
      method: "GET",
    }),

  // Update Company Profile
  updateProfile: (companyId, updates) =>
    request(`/companies/${companyId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Cascaded Full Delete Company
  deleteCompany: (companyId) =>
    request(`/companies/${companyId}`, {
      method: "DELETE",
    }),

  // Get Shareholders Roster
  getShareholders: (companyId) =>
    request(`/companies/${companyId}/shareholders`, {
      method: "GET",
    }),

  // Add Single Shareholder
  addShareholder: (companyId, shareholderData) =>
    request(`/companies/${companyId}/shareholders`, {
      method: "POST",
      body: JSON.stringify(shareholderData),
    }),

  // Bulk Import Shareholders
  bulkAddShareholders: (companyId, shareholders) =>
    request(`/companies/${companyId}/shareholders/bulk`, {
      method: "POST",
      body: JSON.stringify({ shareholders }),
    }),

  // Delete Shareholder
  deleteShareholder: (companyId, shareholderId) =>
    request(`/companies/${companyId}/shareholders/${shareholderId}`, {
      method: "DELETE",
    }),
};

export const expressVotingApi = {
  // Get Voting Session for Company
  getSession: (companyId) =>
    request(`/voting/sessions/${companyId}`, {
      method: "GET",
    }),

  // Create or Update Session Schedule
  saveSession: (sessionData) =>
    request("/voting/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),

  // Get Resolutions and Candidates
  getResolutions: (sessionId) =>
    request(`/voting/resolutions/${sessionId}`, {
      method: "GET",
    }),

  // Add Resolution
  addResolution: (resolutionData) =>
    request("/voting/resolutions", {
      method: "POST",
      body: JSON.stringify(resolutionData),
    }),

  // Delete Resolution
  deleteResolution: (id) =>
    request(`/voting/resolutions/${id}`, {
      method: "DELETE",
    }),

  // Add Candidate
  addCandidate: (candidateData) =>
    request("/voting/candidates", {
      method: "POST",
      body: JSON.stringify(candidateData),
    }),

  // Delete Candidate
  deleteCandidate: (id) =>
    request(`/voting/candidates/${id}`, {
      method: "DELETE",
    }),

  // Get Session Results and Tallies
  getResults: (sessionId) =>
    request(`/voting/results/${sessionId}`, {
      method: "GET",
    }),

  // Cast Ballot (with SHA-256 hash & single-use credential deactivation)
  castVote: (voteData) =>
    request("/voting/cast-vote", {
      method: "POST",
      body: JSON.stringify(voteData),
    }),
};

export const expressShareholderApi = {
  // Shareholder Auth Initiate
  initiateAuth: (loginId, password) =>
    request("/shareholders/auth/initiate", {
      method: "POST",
      body: JSON.stringify({ loginId, password }),
    }),

  // Verify OTP
  verifyOtp: (challengeId, otp) =>
    request("/shareholders/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ challengeId, otp }),
    }),

  // Eligible Voting Events
  getEligibleEvents: (companyId, shareholderId) =>
    request(`/shareholders/eligible-events?companyId=${companyId}&shareholderId=${shareholderId || ""}`, {
      method: "GET",
    }),
};
