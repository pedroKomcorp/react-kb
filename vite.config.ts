import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({  }) => {
  const plugins = [react(), tailwindcss()];

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
    preview: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;

            const modulePath = id.split("node_modules/")[1];
            if (!modulePath) return "vendor";

            const pathParts = modulePath.split("/");
            const packageName = pathParts[0].startsWith("@")
              ? `${pathParts[0]}/${pathParts[1]}`
              : pathParts[0];

            if (["react", "react-dom", "scheduler"].includes(packageName)) {
              return "react-vendor";
            }

            if (
              packageName === "react-router" ||
              packageName.startsWith("@remix-run/")
            ) {
              return "router-vendor";
            }

            if (packageName === "antd") {
              const antdModuleMatch = modulePath.match(/^antd\/(?:es|lib)\/([^/]+)/);
              const antdModule = antdModuleMatch?.[1];
              if (
                antdModule &&
                ["table", "form", "date-picker", "select", "input", "modal", "tabs"].includes(
                  antdModule
                )
              ) {
                return `antd-${antdModule}`;
              }
              return "antd-core";
            }

            if (
              packageName === "@ant-design/icons" ||
              packageName === "@ant-design/icons-svg"
            ) {
              return "antd-icons";
            }

            if (packageName.startsWith("@ant-design/")) {
              return `ant-design-${packageName.split("/")[1]}`;
            }

            if (packageName.startsWith("rc-")) {
              return `rc-${packageName.replace(/^rc-/, "")}`;
            }

            if (packageName === "dayjs") {
              return "dayjs-vendor";
            }

            if (packageName === "axios") {
              return "axios-vendor";
            }

            if (packageName === "@heroicons/react") {
              return "heroicons-vendor";
            }

            return "vendor";
          },
        },
      },
    },
  };
});
