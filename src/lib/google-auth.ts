export function initiateGoogleLogin() {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID ||
    "mock-google-client-id.apps.googleusercontent.com";
  
  const redirectUri = typeof window !== "undefined"
    ? `${window.location.origin}/auth/google/callback`
    : "http://localhost:3000/auth/google/callback";

  const scope = "openid email profile";
  const responseType = "code";
  const accessType = "offline";
  const prompt = "consent";

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=${responseType}&scope=${encodeURIComponent(
    scope
  )}&access_type=${accessType}&prompt=${prompt}`;

  if (typeof window !== "undefined") {
    window.location.href = googleAuthUrl;
  }
}
