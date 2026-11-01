import { RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { router, routes } from "@/router";
import { toNavigation } from "@/router/navigation";
import { NavigationProvider } from "@/router/NavigationProvider";

const navigation = toNavigation(routes);

const App = () => {
  return (
    <ThemeProvider>
      <NavigationProvider items={navigation}>
        <RouterProvider router={router} />
      </NavigationProvider>
    </ThemeProvider>
  );
};

export { App };
