"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              EventsKona
              <Sparkles className="w-5 h-5" />
            </h1>
            <p className="mt-2 text-primary-foreground/90 text-sm">
              Admin Dashboard Access
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@appguts.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3 animate-in">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>

              <div className="pt-4 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Development Credentials
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-foreground/70 font-mono">
                      <span className="font-semibold">Super Admin:</span> admin@appguts.com / admin123
                    </p>
                    <p className="text-xs text-foreground/70 font-mono">
                      <span className="font-semibold">Moderator:</span> moderator@appguts.com / mod123
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Secure administrative access • EventsKona Platform
        </p>
      </div>
    </div>
  );
}
