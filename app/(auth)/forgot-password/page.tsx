import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { AuthForm } from "@/components/auth/AuthForm";
import { forgotPassword } from "../actions";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display text-3xl tracking-display text-ink">
        Reset your <em className="text-gradient-iris font-light italic">password</em>
      </h1>
      <p className="mt-2 text-sm leading-body text-muted">
        Enter your account email and we&apos;ll send you a reset link.
      </p>

      <div className="mt-7">
        <AuthForm action={forgotPassword} submitLabel="Send reset link →" pendingLabel="Sending…">
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourstore.com"
            required
          />
        </AuthForm>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-iris-bright transition-colors duration-200 hover:text-ink">
          Log in
        </Link>
      </p>
    </>
  );
}
