import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthFormShell } from "@/components/auth/AuthFormShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — REVIVE FIGHT CLUB",
  description: "Sign in to your REVIVE FIGHT CLUB account to view orders, manage addresses, and more.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthFormShell
      title="Sign In"
      subtitle="Welcome back. Access your account below."
      footerText="Don't have an account?"
      footerLinkText="Create Account"
      footerLinkHref="/signup"
    >
      {/* Suspense required because LoginForm uses useSearchParams */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthFormShell>
  );
}
