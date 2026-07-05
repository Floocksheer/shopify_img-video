import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { AuthForm } from "@/components/auth/AuthForm";
import { login } from "../actions";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <>
      <h1 className="font-display text-3xl tracking-display text-ink">
        Welcome <em className="text-gradient-iris font-light italic">back</em>
      </h1>
      <p className="mt-2 text-sm leading-body text-muted">
        Log in to keep generating.
      </p>

      <div className="mt-7">
        <AuthForm action={login} submitLabel="Log in →" pendingLabel="Logging in…">
          <input type="hidden" name="next" value={searchParams.next ?? "/dashboard"} />
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourstore.com"
            required
          />
          <div className="space-y-1.5">
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              required
            />
            <p className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-muted transition-colors duration-200 hover:text-ink"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </AuthForm>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        New to Lumora?{" "}
        <Link href="/signup" className="text-iris-bright transition-colors duration-200 hover:text-ink">
          Start your free trial
        </Link>
      </p>
    </>
  );
}
