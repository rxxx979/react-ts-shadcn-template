import type { ReactNode } from "react";

import type { NavigationEntry } from "./navigation";
import { NavigationContext } from "./navigation-context";

/**
 * 把路由表投影出的导航项注入 Layout 子树
 */
const NavigationProvider = ({ items, children }: { items: readonly NavigationEntry[]; children: ReactNode }) => (
  <NavigationContext.Provider value={items}>{children}</NavigationContext.Provider>
);

export { NavigationProvider };
