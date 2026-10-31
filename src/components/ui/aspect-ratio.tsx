import { cn } from "cn";

import { cssVars } from "@/lib/css";

const getRatioStyle = (ratio: number): React.CSSProperties => cssVars({ "--ratio": ratio });

function AspectRatio({ ratio, className, ...props }: React.ComponentProps<"div"> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={getRatioStyle(ratio)}
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  );
}

export { AspectRatio };
