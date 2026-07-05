import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium select-none " +
  "transition-[transform,opacity,box-shadow,background-color,border-color] duration-200 ease-out " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-iris focus-visible:outline-offset-2 " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-iris text-night shadow-button hover:bg-iris-bright hover:-translate-y-px",
  secondary:
    "glass text-ink hover:bg-white/[0.07] hover:-translate-y-px hover:border-white/20",
  ghost: "text-muted hover:text-ink hover:bg-white/[0.05]",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 py-3.5 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, ...props }, ref) => {
    const cls = cn(base, variants[variant], sizes[size], className);
    if (href) {
      return (
        <Link href={href} className={cls}>
          {props.children}
        </Link>
      );
    }
    return <button ref={ref} className={cls} {...props} />;
  },
);
Button.displayName = "Button";
