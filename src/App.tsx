import { useMemo } from "react";
import { RouterProvider } from "react-router";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RootError } from "@/components/layout/RootError";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toast";
import { router, routes } from "@/router";
import { toNavigation } from "@/router/navigation";
import { NavigationProvider } from "@/router/NavigationProvider";
import { useAuthStore } from "@/stores/auth";

const ROOT_ERROR = <RootError />;

const App = () => {
  const user = useAuthStore((state) => state.user);
  const navigation = useMemo(() => toNavigation(routes, user), [user]);

  return (
    <ThemeProvider>
      <ErrorBoundary fallback={ROOT_ERROR}>
        <NavigationProvider items={navigation}>
          <Toaster>
            <RouterProvider router={router} />
          </Toaster>
        </NavigationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export { App };
