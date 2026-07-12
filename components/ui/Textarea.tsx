import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const field = (
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "min-h-[92px] w-full resize-y rounded-xl bg-elevated border border-line px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-dim",
          "transition-[border-color,box-shadow] duration-200",
          "hover:border-white/[0.14] focus:border-iris/60 focus:shadow-[0_0_0_3px_rgba(124,108,255,0.15)] focus:outline-none",
          className,
        )}
        {...props}
      />
    );
    if (!label) return field;
    return (
      <label className="block space-y-1.5" htmlFor={id}>
        <span className="text-xs font-mono uppercase tracking-widest text-muted">{label}</span>
        {field}
        {hint && <span className="block text-xs text-dim">{hint}</span>}
      </label>
    );
  },
);
Textarea.displayName = "Textarea";
