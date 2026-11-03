import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isAuthUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

interface AuthState {
  /**
   * 当前登录用户；null 表示未登录
   */
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

/**
 * 前端 mock 登录态；真实项目应替换为服务端 session / httpOnly cookie
 */
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        set({ user });
      },
      clear: () => {
        set({ user: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      merge: (persisted, current) => {
        const user = typeof persisted === "object" && persisted !== null && "user" in persisted ? persisted.user : null;
        return { ...current, user: isAuthUser(user) ? user : null };
      },
    },
  ),
);

export { useAuthStore };
