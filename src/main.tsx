import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import { RouterProvider } from "react-router-dom";
import "./i18n";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  </StrictMode>,
);
