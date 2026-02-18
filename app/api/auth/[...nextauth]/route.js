import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Required in Vercel env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
// Set NEXTAUTH_URL = https://www.eventskona.com (canonical site is www)

const handler = NextAuth({
  trustHost: true, // Required for correct callback URL on Vercel
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Capture the Google access token on initial sign-in
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the Google access token to the client session
      session.accessToken = token.accessToken;
      return session;
    },
    // Keep redirects on www so they match NEXTAUTH_URL and Google redirect URI (www.eventskona.com)
    redirect({ url, baseUrl }) {
      const target = url.startsWith("/") ? new URL(url, baseUrl).href : url;
      const base = new URL(baseUrl);
      const targetUrl = new URL(target);
      // Same site but different host (www vs non-www): use canonical (baseUrl) origin
      const baseHost = base.host.replace(/^www\./, "") || base.host;
      const targetHost = targetUrl.host.replace(/^www\./, "") || targetUrl.host;
      if (baseHost === targetHost && targetUrl.origin !== base.origin) {
        const canonical = new URL(targetUrl.pathname + targetUrl.search, base.origin);
        return canonical.href;
      }
      return target.startsWith(baseUrl) ? target : baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
