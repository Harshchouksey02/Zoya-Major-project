import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const hasRecoveryParams = useMemo(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    return (
      hash.includes("type=recovery") ||
      hash.includes("access_token=") ||
      new URLSearchParams(search).has("code")
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Support PKCE links (code) + implicit links (access_token in hash)
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Reset link invalid ya expire ho chuka hai.");
          navigate("/login", { replace: true });
          return;
        }

        setIsReady(true);
      } catch (err) {
        console.error("Reset password init error:", err);
        toast.error("Reset link open nahi ho raha. Dubara try karo.");
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasRecoveryParams) {
      toast.error("Reset link missing hai. Forgot password se naya link bhejo.");
      navigate("/login", { replace: true });
      return;
    }

    init();
  }, [hasRecoveryParams, navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password aur Confirm Password match nahi kar rahe.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Clean state: user logs in again with new password.
      await supabase.auth.signOut();

      toast.success("Password update ho gaya. Ab login karo.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      console.error("Update password error:", err);
      toast.error(err?.message || "Password update fail hua. Dubara try karo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>
              {isReady ? "Apna naya password set karo" : "Reset link verify ho raha hai..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isReady ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
