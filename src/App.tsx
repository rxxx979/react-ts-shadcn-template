import { RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { router } from "@/router";

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export { App };
