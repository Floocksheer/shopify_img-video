import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const order = [PLANS.trial, PLANS.starter, PLANS.pro];

function Check() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-iris-bright"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13 4.5l-6.5 7L3 8" />
    </svg>
  );
}

export function PricingTiers() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {order.map((plan, i) => {
        const featured = plan.id === "starter";
        return (
          <Reveal key={plan.id} delay={i * 0.1}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-card p-7 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1",
                featured
                  ? "bg-elevated shadow-glow ring-1 ring-iris/40"
                  : "glass shadow-card hover:shadow-lift",
              )}
            >
              {featured && (
                <Badge tone="iris" className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-night">
                  Most popular
                </Badge>
              )}

              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
                {plan.name}
              </p>

              <div className="mt-4 flex items-baseline gap-1.5">
                {plan.priceMonthly === null ? (
                  <span className="font-display text-5xl tracking-display text-ink">€0</span>
                ) : (
                  <span className="font-display text-5xl tracking-display text-ink">
                    €{plan.priceMonthly}
                  </span>
                )}
                <span className="text-sm text-dim">
                  {plan.priceMonthly === null ? "for 7 days" : "/ month"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-body text-muted">
                {plan.id === "trial" && "Everything in Starter, free for a week. Card required — auto-converts unless you cancel."}
                {plan.id === "starter" && "For stores getting serious about visuals. Enough volume for a full catalog refresh every month."}
                {plan.id === "pro" && "For high-volume stores and agencies. Triple the output, unlimited themes, and API access."}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-ink/85">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={featured ? "primary" : "secondary"}
                href={`/signup?plan=${plan.id === "trial" ? "starter" : plan.id}`}
              >
                {plan.id === "trial" ? "Start free trial" : `Choose ${plan.name}`}
              </Button>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
