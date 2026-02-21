"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { login, loginWithGoogle, setStoredToken } from "@/lib/api";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ?? "";

/**
 * Page Login — formulaire username/password + option « Se connecter avec Google ».
 * Stocke le token (identique pour les deux flux) et redirige vers l'accueil.
 */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      setError(null);
      setLoading(true);
      try {
        const { token } = await loginWithGoogle(idToken);
        setStoredToken(token);
        router.push("/");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Connexion Google échouée");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(username, password);
      setStoredToken(token);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center">
          Connexion
        </h1>
        <p className="mt-2 text-white/70 text-center text-sm">
          Accédez à votre espace Capital of Fusion.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}
          <label className="block">
            <span className="text-sm text-white/80">Identifiant</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nom d'utilisateur"
            />
          </label>
          <label className="block">
            <span className="text-sm text-white/80">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {googleClientId && (
          <>
            <p className="mt-6 text-center text-sm text-white/60">ou</p>
            <div className="mt-4 flex justify-center">
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const token = credentialResponse.credential;
                    if (token) handleGoogleSuccess(token);
                  }}
                  onError={() =>
                    setError("Connexion Google annulée ou indisponible")
                  }
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                  useOneTap={false}
                />
              </GoogleOAuthProvider>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/" className="text-purple-300 hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
