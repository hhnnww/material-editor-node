import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const winax = require("winax");

export function FUN_PSD_插入广告(shopName: string) {
	const app = new winax.Object("Photoshop.Application.200");
	const doc = app.activeDocument;
	const qrDir = path.join(process.cwd(), "public", "二维码");

	const qrFiles = fs
		.readdirSync(qrDir)
		.filter((f) => f.toLowerCase().endsWith(".jpg"));
	for (const qrFile of qrFiles) {
		const qrStem = path.basename(qrFile, path.extname(qrFile));
		if (shopName === qrStem) {
			const qrPath = path.join(qrDir, qrFile);

			const newLayer = doc.ArtLayers.Add();
			newLayer.Name = "淘宝扫码-加入会员-全店免费";

			// 使用 ActionManager 执行 Place (置入) 命令
			const idPlc = app.CharIDToTypeID("Plc ");
			const desc = new winax.Object("Photoshop.ActionDescriptor.200");
			const idnull = app.CharIDToTypeID("null");
			desc.PutPath(idnull, qrPath);
			const idFTms = app.CharIDToTypeID("FTms");
			const idQCSt = app.CharIDToTypeID("QCSt");
			const idQcsa = app.CharIDToTypeID("Qcsa");
			desc.PutEnumerated(idFTms, idQCSt, idQcsa);
			app.ExecuteAction(idPlc, desc, 3); // 3 = DialogModes.NO

			console.log(`已在 PSD 中通过 ActionManager 插入广告图层: ${qrStem}`);

			break;
		}
	}
}
