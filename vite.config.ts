import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({  }) => {
  const plugins = [react(), tailwindcss()];

  

  return {
    server: {
      host: "0.0.0.0",
      port: 5147,
      strictPort: true,
    },
    plugins,
  };
});
