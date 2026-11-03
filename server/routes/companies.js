import express from "express";
import crypto from "crypto";
import { db } from "../db.js";

const router = express.Router();

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password.trim()).digest("hex");
};

/**
 * 1. POST /api/companies/register
 * Company registration with Admin user creation
 */
router.post("/register", async (req, res) => {
  try {
    const { formData } = req.body;
    if (!formData) {
      return res.status(400).json({ error: "Registration formData is required." });
    }

    const cin = (formData.cin || "").trim().toUpperCase();
    const adminEmail = (formData.adminEmail || "").trim().toLowerCase();

    // 1. Check duplicate CIN
    const { data: existingCin } = await db
      .from("companies")
      .select("id")
      .eq("cin_number", cin)
      .maybeSingle();

    if (existingCin) {
      return res.status(409).json({ error: "A company with this CIN number is already registered." });
    }

    // 2. Sign up Admin user in Supabase Auth
    let userId = null;
    const { data: authData, error: authErr } = await db.auth.signUp({
      email: adminEmail,
      password: formData.adminPassword,
    });

    if (authErr) {
      if (authErr.message?.toLowerCase().includes("already registered") || authErr.status === 422) {
        // Try sign in
        const { data: signInData, error: signInErr } = await db.auth.signInWithPassword({
          email: adminEmail,
          password: formData.adminPassword,
        });

        if (signInErr) {
          return res.status(409).json({
            error: "This admin email is already registered. Please use a different email or log in.",
          });
        }
        userId = signInData.user?.id;
      } else {
        return res.status(400).json({ error: authErr.message });
      }
    } else {
      userId = authData.user?.id;
    }

    if (!userId) {
      return res.status(500).json({ error: "Could not establish user account identity." });
    }

    // 3. Insert Company Profile
    const { data: compData, error: compErr } = await db
      .from("companies")
      .insert({
        company_name: formData.companyName.trim(),
        cin_number: cin,
        pan_number: formData.pan ? formData.pan.trim().toUpperCase() : null,
        gstin: formData.gstin ? formData.gstin.trim().toUpperCase() : null,
        company_type: formData.companyType || "listed_public",
        date_of_incorporation: formData.doi || null,
        exchanges: formData.exchanges || [],
        isin_number: formData.isin ? formData.isin.trim().toUpperCase() : null,
        authorized_capital: formData.authorizedCapital ? parseFloat(String(formData.authorizedCapital).replace(/,/g, "")) : 10000000,
        paid_up_capital: formData.paidUpCapital ? parseFloat(String(formData.paidUpCapital).replace(/,/g, "")) : 5000000,
        registered_address: formData.address || "",
        country: formData.country || "India",
        state: formData.state || "",
        district: formData.district || null,
        pin_code: formData.pinCode || "",
        contact_email: adminEmail,
        contact_phone: formData.adminPhone || null,
        cs_name: formData.csName || null,
        cs_membership_number: formData.csMemNumber || null,
        cs_email: formData.csEmail || null,
        cs_phone: formData.csPhone || null,
        sebi_email: formData.sebiEmail || null,
        sebi_reg_number: formData.sebiRegNumber || null,
        rta_name: formData.rtaName || null,
        rta_reg_number: formData.rtaRegNumber || null,
      })
      .select()
      .single();

    if (compErr) {
      console.error("Insert company error:", compErr);
      return res.status(400).json({ error: compErr.message });
    }

    // 4. Link Company Admin
    await db.from("company_admins").insert({
      company_id: compData.id,
      user_id: userId,
      full_name: formData.adminName || "Corporate Administrator",
      phone: formData.adminPhone || null,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      company: compData,
      userId,
    });
  } catch (err) {
    console.error("Register company error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

/**
 * 2. POST /api/companies/login
 * Company Admin Login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { data: authData, error: authErr } = await db.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (authErr) {
      return res.status(401).json({ error: authErr.message });
    }

    const { data: adminData, error: adminErr } = await db
      .from("company_admins")
      .select("*, companies(*)")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (adminErr || !adminData) {
      return res.status(404).json({ error: "No corporate profile associated with this admin account." });
    }

    return res.json({
      user: authData.user,
      session: authData.session,
      admin: adminData,
      company: adminData.companies,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 3. GET /api/companies/:id
 * Retrieve Company Profile
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await db
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 4. PUT /api/companies/:id
 * Update Company Profile
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await db
      .from("companies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 5. DELETE /api/companies/:id
 * Full Cascaded Deletion
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sessions } = await db
      .from("voting_sessions")
      .select("id")
      .eq("company_id", id);

    const sessionIds = (sessions || []).map((s) => s.id);

    if (sessionIds.length > 0) {
      await db.from("votes").delete().in("voting_session_id", sessionIds);
      await db.from("candidates").delete().in("voting_session_id", sessionIds);
      await db.from("resolutions").delete().in("voting_session_id", sessionIds);
      await db.from("voting_sessions").delete().eq("company_id", id);
    }

    await db.from("shareholders").delete().eq("company_id", id);
    await db.from("company_admins").delete().eq("company_id", id);

    const { error: compErr } = await db.from("companies").delete().eq("id", id);
    if (compErr) return res.status(500).json({ error: compErr.message });

    return res.json({ success: true, message: "Company and all associated records permanently deleted." });
  } catch (err) {
    console.error("Delete company error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 6. GET /api/companies/:id/shareholders
 * Fetch shareholder roster
 */
router.get("/:id/shareholders", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await db
      .from("shareholders")
      .select("*")
      .eq("company_id", id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 7. POST /api/companies/:id/shareholders
 * Add single shareholder
 */
router.post("/:id/shareholders", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, sharesHeld, category, holdingType, panNumber, dpidClientId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Shareholder name and email are required." });
    }

    const loginId = `SH-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const password = `Vote@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = hashPassword(password);

    const { data, error } = await db
      .from("shareholders")
      .insert({
        company_id: id,
        shareholder_name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        shares_held: parseInt(sharesHeld, 10) || 100,
        category: category || "RETAIL",
        holding_type: holdingType || "NSDL_DEMAT",
        pan_number: panNumber ? panNumber.trim().toUpperCase() : null,
        dpid_client_id: dpidClientId ? dpidClientId.trim() : null,
        login_id: loginId,
        password_hash: passwordHash,
        is_credential_used: false,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      shareholder: data,
      generatedCredentials: { loginId, password },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 8. POST /api/companies/:id/shareholders/bulk
 * Bulk insert shareholders from CSV
 */
router.post("/:id/shareholders/bulk", async (req, res) => {
  try {
    const { id } = req.params;
    const { shareholders } = req.body;

    if (!Array.isArray(shareholders) || shareholders.length === 0) {
      return res.status(400).json({ error: "Shareholders array is required." });
    }

    const records = shareholders.map((s) => {
      const loginId = `SH-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const password = `Vote@${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = hashPassword(password);

      return {
        company_id: id,
        shareholder_name: s.name || s.shareholder_name,
        email: (s.email || "").toLowerCase().trim(),
        phone: s.phone || null,
        shares_held: parseInt(s.sharesHeld || s.shares_held, 10) || 100,
        category: s.category || "RETAIL",
        holding_type: s.holdingType || "NSDL_DEMAT",
        pan_number: s.panNumber ? s.panNumber.trim().toUpperCase() : null,
        dpid_client_id: s.dpidClientId || null,
        login_id: loginId,
        password_hash: passwordHash,
        is_credential_used: false,
      };
    });

    const { data, error } = await db.from("shareholders").insert(records).select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ count: data?.length || 0, shareholders: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 9. DELETE /api/companies/:id/shareholders/:shareholderId
 * Delete shareholder
 */
router.delete("/:id/shareholders/:shareholderId", async (req, res) => {
  try {
    const { id, shareholderId } = req.params;

    // Remove any votes cast by this shareholder first
    await db.from("votes").delete().eq("shareholder_id", shareholderId);

    const { error } = await db
      .from("shareholders")
      .delete()
      .eq("id", shareholderId)
      .eq("company_id", id);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
