import { createContext } from "react";

import type { NavigationEntry } from "./navigation";

/**
 * 路由表投影出的导航数据
 */
const NavigationContext = createContext<readonly NavigationEntry[]>([]);

export { NavigationContext };
