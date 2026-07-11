import { AuthForm, Input } from "lumora";

export function SignIn() {
  return (
    <div className="w-80">
      <AuthForm
        action={async () => ({})}
        submitLabel="Sign in"
        pendingLabel="Signing in…"
      >
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@yourstore.com"
        />
        <Input id="password" name="password" type="password" label="Password" />
      </AuthForm>
    </div>
  );
}

export function SignUp() {
  return (
    <div className="w-80">
      <AuthForm
        action={async () => ({})}
        submitLabel="Start free trial"
        pendingLabel="Creating account…"
      >
        <Input id="store" name="store" label="Store name" placeholder="Atölye Ceramics" />
        <Input
          id="email2"
          name="email"
          type="email"
          label="Email"
          placeholder="you@yourstore.com"
        />
        <Input id="password2" name="password" type="password" label="Password" />
      </AuthForm>
    </div>
  );
}
