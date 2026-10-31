import type { CSSProperties } from "react";

/**
 * 带 CSS 变量的样式：自定义变量以 `--` 开头，允许 string / number
 */
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const cssVars = (vars: Record<`--${string}`, string | number>): CSSVars => vars;

export { cssVars };
export type { CSSVars };
