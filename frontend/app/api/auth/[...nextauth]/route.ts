import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  // Configure one or more authentication providers
  providers: [
    
    // ... add more providers as needed
  ],
  // Optional: Add callbacks, database adapter, etc.
});

export { handler as GET, handler as POST };