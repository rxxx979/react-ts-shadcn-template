import { RouterProvider } from "react-router";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RootError } from "@/components/layout/RootError";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { router, routes } from "@/router";
import { toNavigation } from "@/router/navigation";
import { NavigationProvider } from "@/router/NavigationProvider";

const navigation = toNavigation(routes);
const ROOT_ERROR = <RootError />;

const App = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary fallback={ROOT_ERROR}>
        <NavigationProvider items={navigation}>
          <RouterProvider router={router} />
        </NavigationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export { App };
