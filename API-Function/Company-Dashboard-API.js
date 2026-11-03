/**
 * ============================================================================
 * ROUTE: COMPANY DASHBOARD & SHAREHOLDER REGISTRY
 * Path: /company-dashboard
 * ============================================================================
 * Handles corporate administrative functions including shareholder roster ledger,
 * adding/editing members, CSV bulk imports, atomic cascaded deletion, credential
 * dispatch, and Section 103 statutory quorum calculations.
 */

import { supabase } from "@/integrations/supabase/client";

export const CompanyDashboardAPI = {
    /**
     * 1. GET COMPANY DETAILS & PROFILE
     * Loads the authenticated company's profile, CIN, PAN, CS details, and capital structure.
     */
    getCompanyProfile: async (companyId) => {
        const { data, error } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * 2. GET COMPANY SHAREHOLDERS ROSTER
     * Fetches all registered shareholders, login IDs, share counts, and credential status.
     */
    getShareholders: async (companyId) => {
        const { data, error } = await supabase
            .from("shareholders")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * 3. ADD INDIVIDUAL SHAREHOLDER
     * Registers a single stakeholder with SHA-256 hashed password and generated Login Token.
     */
    addShareholder: async (companyId, shareholderData) => {
        const loginId = `SH-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const initialPassword = `Vote@${Math.floor(1000 + Math.random() * 9000)}`;

        const encoder = new TextEncoder();
        const hashBuf = await crypto.subtle.digest("SHA-256", encoder.encode(initialPassword));
        const passwordHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

        const { data, error } = await supabase
            .from("shareholders")
            .insert({
                company_id: companyId,
                shareholder_name: shareholderData.name.trim(),
                email: shareholderData.email.trim().toLowerCase(),
                phone: shareholderData.phone?.trim() || null,
                shares_held: parseInt(shareholderData.shares) || 1,
                login_id: loginId,
                password_hash: passwordHash,
                is_credential_used: false,
                credential_created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return { shareholder: data, generatedPassword: initialPassword };
    },

    /**
     * 4. UPDATE EXISTING SHAREHOLDER
     * Updates name, email, phone, or voting share entitlement.
     */
    updateShareholder: async (shareholderId, updates) => {
        const { data, error } = await supabase
            .from("shareholders")
            .update({
                shareholder_name: updates.name?.trim(),
                email: updates.email?.trim()?.toLowerCase(),
                phone: updates.phone?.trim(),
                shares_held: updates.shares !== undefined ? parseInt(updates.shares) : undefined,
            })
            .eq("id", shareholderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * 5. DELETE SHAREHOLDER (ATOMIC CASCADED DELETION)
     * Calls PostgreSQL RPC `delete_shareholder_cascaded` to atomically purge:
     * - Referenced votes
     * - Voter master roster rows
     * - Proxy delegations
     * - Auth sessions
     * - Shareholder master record
     */
    deleteShareholderCascaded: async (shareholderId, companyId) => {
        // Try dedicated atomic database stored procedure first
        try {
            const { data: rpcRes, error: rpcErr } = await supabase.rpc("delete_shareholder_cascaded", {
                p_shareholder_id: shareholderId,
                p_company_id: companyId
            });
            if (!rpcErr && rpcRes) return true;
        } catch (rpcEx) {}

        // Fallback: Ordered manual cascade
        await supabase.from("votes").delete().eq("shareholder_id", shareholderId);
        await supabase.from("votes").delete().eq("casting_shareholder_id", shareholderId);
        await supabase.from("voter_master").delete().eq("shareholder_id", shareholderId);
        await supabase.from("proxy_delegations").delete().eq("delegator_id", shareholderId);
        await supabase.from("proxy_delegations").delete().eq("proxy_id", shareholderId);
        await supabase.from("shareholder_auth_sessions").delete().eq("shareholder_id", shareholderId);

        const { error } = await supabase
            .from("shareholders")
            .delete()
            .eq("id", shareholderId)
            .eq("company_id", companyId);

        if (error) throw error;
        return true;
    },

    /**
     * 6. RESEND SHAREHOLDER CREDENTIALS EMAIL
     * Generates a refreshed security password, hashes it, and triggers invitation dispatch.
     */
    resendCredentials: async (shareholder, companyName) => {
        const newPassword = `Vote@${Math.floor(1000 + Math.random() * 9000)}`;
        const encoder = new TextEncoder();
        const hashBuf = await crypto.subtle.digest("SHA-256", encoder.encode(newPassword));
        const newHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

        const { error: updateErr } = await supabase
            .from("shareholders")
            .update({
                password_hash: newHash,
                is_credential_used: false,
                credential_created_at: new Date().toISOString(),
            })
            .eq("id", shareholder.id);

        if (updateErr) throw updateErr;

        // Dispatch email via Edge Function
        await supabase.functions.invoke("send-meeting-invites", {
            body: {
                sessionId: null,
                companyName: companyName,
                recipients: [{
                    email: shareholder.email,
                    name: shareholder.shareholder_name,
                    loginId: shareholder.login_id,
                    password: newPassword,
                    shares: shareholder.shares_held,
                }]
            }
        });

        return { success: true, loginId: shareholder.login_id, password: newPassword };
    },

    /**
     * 7. GET STATUTORY QUORUM (SECTION 103 COMPANIES ACT, 2013)
     * Calculates required members based on shareholder registry size:
     * - Up to 1,000 members: 5 personally present
     * - 1,001 to 5,000 members: 15 personally present
     * - Above 5,000 members: 30 personally present
     */
    calculateQuorum: (totalMembers, attendedMembers) => {
        let required = 5;
        if (totalMembers > 5000) required = 30;
        else if (totalMembers > 1000) required = 15;

        return {
            requiredQuorum: required,
            attendedMembers: attendedMembers,
            isQuorumMet: attendedMembers >= required,
        };
    }
};

