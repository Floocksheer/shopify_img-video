import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-11 w-full rounded-xl bg-elevated border border-line px-4 text-sm text-ink placeholder:text-dim",
          "transition-[border-color,box-shadow] duration-200",
          "hover:border-white/[0.14] focus:border-iris/60 focus:shadow-[0_0_0_3px_rgba(124,108,255,0.15)] focus:outline-none",
          className,
        )}
        {...props}
      />
    );
    if (!label) return input;
    return (
      <label className="block space-y-1.5" htmlFor={id}>
        <span className="text-xs font-mono uppercase tracking-widest text-muted">{label}</span>
        {input}
      </label>
    );
  },
);
Input.displayName = "Input";
