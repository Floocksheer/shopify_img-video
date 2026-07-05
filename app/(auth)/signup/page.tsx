import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { AuthForm } from "@/components/auth/AuthForm";
import { signup } from "../actions";

export const metadata: Metadata = { title: "Start your free trial" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const plan = searchParams.plan === "pro" ? "pro" : "starter";

  return (
    <>
      <h1 className="font-display text-3xl tracking-display text-ink">
        Start your <em className="text-gradient-iris font-light italic">free trial</em>
      </h1>
      <p className="mt-2 text-sm leading-body text-muted">
        7 days of full access. Card required at checkout — you won&apos;t be
        charged until the trial ends.
      </p>

      <div className="mt-7">
        <AuthForm action={signup} submitLabel="Create account →" pendingLabel="Creating account…">
          <input type="hidden" name="plan" value={plan} />
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourstore.com"
            required
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </AuthForm>
      </div>

      <div className="mt-6 space-y-1.5 border-t border-line pt-5">
        {["7-day trial with full Starter features", "Payment secured by Stripe", "Cancel in one click, any time"].map((t) => (
          <p key={t} className="flex items-center gap-2 text-xs text-muted">
            <svg className="h-3.5 w-3.5 text-success" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M13 4.5l-6.5 7L3 8" />
            </svg>
            {t}
          </p>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-iris-bright transition-colors duration-200 hover:text-ink">
          Log in
        </Link>
      </p>
    </>
  );
}
