import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

const require = createRequire(import.meta.url);
const winax = require("winax");

export const FUN_EPS文件转AI文件 = async (props: { materialPath: string }) => {
	const epsFileList = FUN_递归遍历文件夹(props.materialPath, [".eps"]);

	if (epsFileList.length === 0) return;

	try {
		const app = new winax.Object("Illustrator.Application");
		app.UserInteractionLevel = -1; // 忽略警告

		for (const epsPath of epsFileList) {
			try {
				const fileDir = path.dirname(epsPath);
				const fileStem = path.basename(epsPath, path.extname(epsPath));
				const aiPath = path.join(fileDir, `${fileStem}.ai`);

				// 如果 AI 文件已存在，则跳过
				if (fs.existsSync(aiPath)) {
					console.log(`AI 文件已存在，跳过: ${aiPath}`);
					continue;
				}

				console.log(`正在转换 EPS 为 AI: ${epsPath}`);
				const doc = app.Open(epsPath);

				const aiSaveOptions = new winax.Object(
					"Illustrator.IllustratorSaveOptions",
				);
				doc.SaveAs(aiPath, aiSaveOptions);

				// 关闭文档 (2 = SaveOptions.DONOTCHANGES)
				doc.Close(2);
				console.log(`转换成功: ${aiPath}`);
			} catch (err) {
				console.error(`转换单个文件失败: ${epsPath}`, err);
			}
		}
	} catch (error) {
		console.error("调用 Illustrator 失败，请确保已安装 Illustrator", error);
	}
};
