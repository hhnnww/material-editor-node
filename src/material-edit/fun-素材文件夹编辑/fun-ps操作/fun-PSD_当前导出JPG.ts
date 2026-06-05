import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const winax = require("winax");

export function FUN_当前PSD导出JPG(props: { materialPath: string }) {
	const app = new winax.Object("Photoshop.Application");
	const doc = app.activeDocument;

	const psdDir = path.dirname(props.materialPath);
	const psdStem = path.basename(
		props.materialPath,
		path.extname(props.materialPath),
	);
	const targetImagePath = path.join(psdDir, `${psdStem}.jpg`);

	const exportOptions = new winax.Object("Photoshop.ExportOptionsSaveForWeb");
	exportOptions.Format = 6;
	exportOptions.Quality = 80;
	doc.Export(targetImagePath, 2, exportOptions);
}
