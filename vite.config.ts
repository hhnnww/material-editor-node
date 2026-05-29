import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { vitePluginLocalImage } from "#/lib/vite-plug";

const config = defineConfig({
	optimizeDeps: {
		exclude: ["winax", "opentype.js"],
	},
	ssr: {
		external: ["winax", "opentype.js"],
		noExternal: ["opentype.js"],
	},
	build: {
		rolldownOptions: {
			external: ["winax"],
		},
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		vitePluginLocalImage(),
		devtools(),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
