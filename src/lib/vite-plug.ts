import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import mime from "mime-types";
import type { Connect, Plugin } from "vite";

// 我们换成一个非常独特的虚拟前缀，防止跟任何路由冲突
const VIRTUAL_PREFIX = "/__local_disk_stream__/";

const handler: Connect.NextHandleFunction = (
	req: IncomingMessage,
	res: ServerResponse,
	next: Connect.NextFunction,
) => {
	const url = req.url;

	if (url?.includes(VIRTUAL_PREFIX)) {
		// 提取出真实的盘符路径
		const startIndex = url.indexOf(VIRTUAL_PREFIX) + VIRTUAL_PREFIX.length;
		// 去掉可能存在的 query 参数
		const cleanUrl = url.slice(startIndex).split("?")[0];

		const decodedPath = decodeURIComponent(cleanUrl);
		const normalizedPath = path.normalize(decodedPath);

		if (fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile()) {
			const contentType =
				mime.lookup(normalizedPath) || "application/octet-stream";
			res.writeHead(200, {
				"Content-Type": contentType,
				"Cache-Control": "max-age=31536000",
			});
			fs.createReadStream(normalizedPath).pipe(res);
			return;
		} else {
			res.writeHead(404);
			res.end("Local File Not Found");
			return;
		}
	}
	next();
};

export function vitePluginLocalImage(): Plugin {
	return {
		name: "vite-plugin-local-image",
		// 开发环境
		configureServer(server) {
			server.middlewares.use(handler);
		},
		// 预览环境 (打包后通过 vite preview 运行)
		configurePreviewServer(server) {
			server.middlewares.use(handler);
		},
	};
}
