import express from "express";
import crypto from "crypto";
import { db } from "../db.js";

const router = express.Router();

const sha256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * 1. GET /api/voting/sessions/:companyId
 * Get latest voting session for a company
 */
router.get("/sessions/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { data, error } = await db
      .from("voting_sessions")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/voting/sessions
 * Create or update voting session schedule
 */
router.post("/sessions", async (req, res) => {
  try {
    const { sessionPayload, sessionId } = req.body;

    if (!sessionPayload) {
      return res.status(400).json({ error: "sessionPayload is required." });
    }

    let result;
    if (sessionId) {
      const { data, error } = await db
        .from("voting_sessions")
        .update(sessionPayload)
        .eq("id", sessionId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    } else {
      const { data, error } = await db
        .from("voting_sessions")
        .insert(sessionPayload)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    }

    return res.json(result);
  } catch (err) {
    console.error("Save session error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 3. GET /api/voting/resolutions/:sessionId
 * Get all resolutions and candidates for a session
 */
router.get("/resolutions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [resResult, candResult] = await Promise.all([
      db.from("resolutions").select("*").eq("voting_session_id", sessionId).order("resolution_number", { ascending: true }),
      db.from("candidates").select("*").eq("voting_session_id", sessionId).order("candidate_name", { ascending: true }),
    ]);

    if (resResult.error) return res.status(400).json({ error: resResult.error.message });
    if (candResult.error) return res.status(400).json({ error: candResult.error.message });

    return res.json({
      resolutions: resResult.data || [],
      candidates: candResult.data || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 4. POST /api/voting/resolutions
 * Add resolution
 */
router.post("/resolutions", async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload || !payload.voting_session_id || !payload.title) {
      return res.status(400).json({ error: "voting_session_id and title are required." });
    }

    const { data, error } = await db
      .from("resolutions")
      .insert(payload)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 5. DELETE /api/voting/resolutions/:id
 * Delete resolution
 */
router.delete("/resolutions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await db.from("resolutions").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 6. POST /api/voting/candidates
 * Add candidate
 */
router.post("/candidates", async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload || !payload.voting_session_id || !payload.candidate_name) {
      return res.status(400).json({ error: "voting_session_id and candidate_name are required." });
    }

    const { data, error } = await db
      .from("candidates")
      .insert(payload)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 7. DELETE /api/voting/candidates/:id
 * Delete candidate
 */
router.delete("/candidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await db.from("candidates").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 8. GET /api/voting/results/:sessionId
 * Get voting results
 */
router.get("/results/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { data: votes, error } = await db
      .from("votes")
      .select("*, resolutions(*), candidates(*)")
      .eq("voting_session_id", sessionId);

    if (error) return res.status(400).json({ error: error.message });
    return res.json(votes || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 9. POST /api/voting/cast-vote
 * Cast ballot with SHA-256 cryptographic receipt and single-use credential deactivation
 */
router.post("/cast-vote", async (req, res) => {
  try {
    const {
      voting_session_id,
      resolution_id,
      candidate_id,
      vote_choice,
      shareholder_id,
      share_weight,
    } = req.body;

    if (!shareholder_id || !vote_choice) {
      return res.status(400).json({ error: "Missing required voting fields." });
    }

    // 1. Check if vote already cast
    let query = db
      .from("votes")
      .select("id, vote_hash, created_at, vote_choice, vote_value")
      .eq("shareholder_id", shareholder_id);

    if (resolution_id) query = query.eq("resolution_id", resolution_id);
    if (candidate_id) query = query.eq("candidate_id", candidate_id);

    const { data: existingVote } = await query.maybeSingle();

    if (existingVote) {
      // Ensure deactivation flag is set
      await db.from("shareholders").update({ is_credential_used: true }).eq("id", shareholder_id);
      return res.status(200).json({
        success: true,
        already_voted: true,
        vote_hash: existingVote.vote_hash,
        vote_choice: existingVote.vote_choice || existingVote.vote_value,
        timestamp: existingVote.created_at,
      });
    }

    // 2. Fetch shareholder weight
    const { data: shData } = await db
      .from("shareholders")
      .select("shares_held, is_credential_used")
      .eq("id", shareholder_id)
      .maybeSingle();

    const weight = share_weight || shData?.shares_held || 1;
    const timestamp = new Date().toISOString();
    const rawVotePayload = `${shareholder_id}:${voting_session_id}:${resolution_id || candidate_id}:${vote_choice}:${weight}:${timestamp}`;
    const voteHash = sha256(rawVotePayload);

    // 3. Insert Vote
    const { data: newVote, error: voteErr } = await db
      .from("votes")
      .insert({
        voting_session_id: voting_session_id || null,
        resolution_id: resolution_id || null,
        candidate_id: candidate_id || null,
        shareholder_id,
        vote_choice,
        vote_value: vote_choice.toLowerCase(),
        share_weight: weight,
        vote_hash: voteHash,
        created_at: timestamp,
      })
      .select()
      .single();

    if (voteErr) {
      if (voteErr.code === "23505" || voteErr.message?.includes("unique")) {
        await db.from("shareholders").update({ is_credential_used: true }).eq("id", shareholder_id);
        return res.status(200).json({
          success: true,
          already_voted: true,
          vote_hash: voteHash,
          vote_choice,
          timestamp,
        });
      }
      return res.status(400).json({ error: voteErr.message });
    }

    // 4. MCA Rule 20 single-use credential deactivation
    await db
      .from("shareholders")
      .update({ is_credential_used: true })
      .eq("id", shareholder_id);

    return res.status(201).json({
      success: true,
      vote_hash: voteHash,
      vote_choice,
      timestamp,
      deactivated: true,
      receipt: {
        vote_id: newVote.id,
        vote_hash: voteHash,
        vote_value: vote_choice.toUpperCase(),
        timestamp,
      },
    });
  } catch (err) {
    console.error("Cast vote error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
