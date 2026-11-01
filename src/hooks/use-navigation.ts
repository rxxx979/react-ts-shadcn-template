import { useContext } from "react";

import type { NavigationEntry } from "@/router/navigation";
import { NavigationContext } from "@/router/navigation-context";

/**
 * 读取当前路由表投影出的导航项
 */
const useNavigation = (): readonly NavigationEntry[] => useContext(NavigationContext);

export { useNavigation };
