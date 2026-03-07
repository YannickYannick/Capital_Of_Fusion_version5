"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { login, loginWithGoogle, setStoredToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ?? "";

/**
 * Page Login — formulaire username/password + Google OAuth.
 * Après connexion, redirige vers /dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const afterLogin = useCallback(
    async (token: string) => {
      setStoredToken(token);
      await refresh(); // rehydrate AuthContext immédiatement
      router.push("/dashboard");
    },
    [router, refresh]
  );

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      setError(null);
      setLoading(true);
      try {
        const { token } = await loginWithGoogle(idToken);
        await afterLogin(token);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Connexion Google échouée");
      } finally {
        setLoading(false);
      }
    },
    [afterLogin]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(username, password);
      await afterLogin(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
            Capital of Fusion
          </p>
          <h1 className="text-3xl font-black text-white">Connexion</h1>
          <p className="mt-2 text-white/50 text-sm">
            Accédez à votre espace personnel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm" role="alert">
              {error}
            </div>
          )}
          <label className="block">
            <span className="text-sm text-white/70 font-medium">Identifiant</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Nom d'utilisateur"
            />
          </label>
          <label className="block">
            <span className="text-sm text-white/70 font-medium">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition disabled:opacity-50 mt-2"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {googleClientId && (
          <>
            <p className="mt-6 text-center text-sm text-white/40">ou</p>
            <div className="mt-4 flex justify-center">
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const token = credentialResponse.credential;
                    if (token) handleGoogleSuccess(token);
                  }}
                  onError={() => setError("Connexion Google annulée ou indisponible")}
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                  useOneTap={false}
                />
              </GoogleOAuthProvider>
            </div>
          </>
        )}

        <div className="mt-8 flex justify-between text-sm text-white/40">
          <Link href="/" className="hover:text-white/70 transition">
            ← Accueil
          </Link>
          <Link href="/register" className="hover:text-purple-300 transition">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
