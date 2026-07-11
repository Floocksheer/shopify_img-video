// Browser shim for next/navigation — static values for previews rendered
// outside the Next.js runtime. usePathname returns /dashboard so Sidebar
// shows a realistic active state.
export function usePathname(): string {
  return "/dashboard";
}

export function useRouter() {
  const noop = () => {};
  return {
    push: noop,
    replace: noop,
    back: noop,
    forward: noop,
    prefetch: noop,
    refresh: noop,
  };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function useParams(): Record<string, string> {
  return {};
}

export function redirect(_url: string): void {}
export function notFound(): void {}
