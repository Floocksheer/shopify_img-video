// Browser shim for next/link — renders a plain anchor. The design-sync bundle
// runs outside the Next.js runtime, where <Link> would require the app router.
import * as React from "react";

const Link = React.forwardRef<HTMLAnchorElement, any>(function Link(
  { href, children, prefetch, replace, scroll, shallow, legacyBehavior, ...rest },
  ref,
) {
  const url = typeof href === "string" ? href : "#";
  return (
    <a ref={ref} href={url} {...rest}>
      {children}
    </a>
  );
});

export default Link;
