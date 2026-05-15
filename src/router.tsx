import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "./App";

function getRouterBaseName() {
  const baseUrl = import.meta.env.BASE_URL;

  // BrowserRouter basename must be an absolute path; ignore '/' and './'.
  if (!baseUrl || baseUrl === "/" || baseUrl === "./") {
    return undefined;
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

const routerBaseName = getRouterBaseName();

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
    },
    {
      path: "/tools/image-size",
      element: <App />,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ],
  {
    basename: routerBaseName,
  },
);
