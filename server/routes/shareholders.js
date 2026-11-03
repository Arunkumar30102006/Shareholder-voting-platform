import express from "express";
import crypto from "crypto";
import { db } from "../db.js";

const router = express.Router();

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password.trim()).digest("hex");
};

const activeOtps = new Map();

/**
 * 1. POST /api/shareholders/auth/initiate
 * Validate login_id and password, check is_credential_used, dispatch OTP
 */
router.post("/auth/initiate", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: "Shareholder Login ID and password are required." });
    }

    const cleanLoginId = loginId.trim().toUpperCase();
    const passwordHash = hashPassword(password);

    // 1. Fetch shareholder record
    const { data: shareholder, error: shErr } = await db
      .from("shareholders")
      .select("*, companies(*)")
      .eq("login_id", cleanLoginId)
      .maybeSingle();

    if (shErr || !shareholder) {
      return res.status(401).json({ error: "Invalid Shareholder Login ID or credentials not found." });
    }

    // 2. Check password
    if (shareholder.password_hash !== passwordHash) {
      return res.status(401).json({ error: "Invalid password. Please check your credentials." });
    }

    // 3. MCA Rule 20: Check if credential is already used
    if (shareholder.is_credential_used) {
      return res.status(403).json({
        error: "Your voting credentials have already been used to cast a ballot and are deactivated pursuant to MCA Rule 20.",
        deactivated: true,
      });
    }

    // 4. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = `auth-${crypto.randomUUID()}`;

    activeOtps.set(challengeId, {
      shareholderId: shareholder.id,
      email: shareholder.email,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`[Express Auth] Generated OTP for ${shareholder.email} (ID: ${shareholder.login_id}): ${otp}`);

    const maskedEmail = shareholder.email
      ? shareholder.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${"*".repeat(Math.max(b.length, 3))}${c}`)
      : "registered email";

    return res.json({
      success: true,
      challengeId,
      maskedEmail,
      demoOtp: otp,
      message: `OTP sent successfully to ${maskedEmail}`,
    });
  } catch (err) {
    console.error("Initiate auth error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/shareholders/auth/verify-otp
 * Verify 6-digit OTP
 */
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({ error: "challengeId and otp are required." });
    }

    const stored = activeOtps.get(challengeId);
    if (!stored) {
      return res.status(401).json({ error: "Invalid or expired verification session." });
    }

    if (Date.now() > stored.expiresAt) {
      activeOtps.delete(challengeId);
      return res.status(401).json({ error: "OTP has expired. Please request a new one." });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(401).json({ error: "Incorrect verification code. Please try again." });
    }

    const { data: shareholder, error: shErr } = await db
      .from("shareholders")
      .select("*, companies(*)")
      .eq("id", stored.shareholderId)
      .single();

    if (shErr || !shareholder) {
      return res.status(404).json({ error: "Shareholder record not found." });
    }

    activeOtps.delete(challengeId);
    const sessionToken = `sh-token-${crypto.randomUUID()}`;

    return res.json({
      success: true,
      token: sessionToken,
      shareholder,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 3. GET /api/shareholders/eligible-events
 * Fetch open voting sessions for shareholder's company
 */
router.get("/eligible-events", async (req, res) => {
  try {
    const { companyId, shareholderId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId query parameter is required." });
    }

    const { data: sessions, error } = await db
      .from("voting_sessions")
      .select("*, companies(*)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    let votedSessionIds = new Set();
    if (shareholderId) {
      const { data: votes } = await db
        .from("votes")
        .select("voting_session_id")
        .eq("shareholder_id", shareholderId);

      if (votes) {
        votes.forEach((v) => votedSessionIds.add(v.voting_session_id));
      }
    }

    const eventsWithStatus = (sessions || []).map((session) => ({
      ...session,
      has_voted: votedSessionIds.has(session.id),
    }));

    return res.json(eventsWithStatus);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
