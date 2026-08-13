import type { Metadata } from "next";
import { AuthFormShell } from "@/components/auth/AuthFormShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account — REVIVE FIGHT CLUB",
  description: "Join REVIVE FIGHT CLUB. Create your account to start shopping.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthFormShell
      title="Create Account"
      subtitle="Join the fight. Create your RFC account."
      footerText="Already have an account?"
      footerLinkText="Sign In"
      footerLinkHref="/login"
    >
      <SignupForm />
    </AuthFormShell>
  );
}
