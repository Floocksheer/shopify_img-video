import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-iris-bright">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-display text-ink sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-body text-muted">{description}</p>
      )}
    </Reveal>
  );
}
