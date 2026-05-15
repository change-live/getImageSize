import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const githubBase = repositoryName ? `/${repositoryName}/` : "/";

  return {
    plugins: [react()],
    // Build for GitHub Pages repo URL, but keep dev server on root path.
    base: command === "build" ? process.env.VITE_BASE_PATH ?? githubBase : "/",
    server: {
      port: 3000,
    },
  };
});
