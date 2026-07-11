// Browser shim for next/image — renders a plain <img>. Next's optimizer and
// loader pipeline don't exist outside the Next.js runtime.
import * as React from "react";

const Image = React.forwardRef<HTMLImageElement, any>(function Image(
  {
    src,
    alt = "",
    fill,
    width,
    height,
    loader,
    quality,
    priority,
    placeholder,
    blurDataURL,
    sizes,
    unoptimized,
    style,
    ...rest
  },
  ref,
) {
  const url = typeof src === "string" ? src : (src && src.src) || "";
  const mergedStyle = fill
    ? {
        position: "absolute" as const,
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: (style && style.objectFit) || ("cover" as const),
        ...style,
      }
    : style;
  return (
    <img
      ref={ref}
      src={url}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={mergedStyle}
      {...rest}
    />
  );
});

export default Image;
