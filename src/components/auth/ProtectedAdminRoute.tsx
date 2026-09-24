import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { SEO } from "@/components/layout/SEO";

const ProtectedAdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                // Check if user exists in company_admins table
                const { data, error } = await supabase
                    .from("company_admins")
                    .select("id")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                if (error || !data) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                // Enforce Server-Side 2FA Verification via PostgreSQL RPC
                // Decision is made entirely on the database server; browser sessionStorage cannot bypass this
                const { data: is2FaVerified, error: rpcError } = await supabase.rpc("check_company_admin_2fa_status");

                if (rpcError || !is2FaVerified) {
                    setIsAdmin(false);
                } else {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <SEO
                    title="Company Admin Portal | Vote India Secure"
                    description="Protected administration portal."
                    noindex={true}
                />
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAdmin) {
        toast.error("Unauthorized access or 2FA verification required. Please log in.");
        supabase.auth.signOut();
        return <Navigate to="/company-login" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
