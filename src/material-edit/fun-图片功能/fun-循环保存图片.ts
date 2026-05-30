import sharp from "sharp";
import { FUN_保存图片 } from "./fun-保存图片";

export async function FUN_循环保存图片(
	im: Buffer<ArrayBufferLike>,
	startNum: number,
) {
	const itemHeight = 2000;
	const sim = sharp(im);
	const metadata = await sim.metadata();
	const totalHeight = metadata.height || 0;
	const parts = Math.ceil(totalHeight / itemHeight);
	console.log(`总高度: ${totalHeight}, 分片数量: ${parts}`);
	for (let i = 0; i < parts; i++) {
		const top = i * itemHeight;
		const height = Math.min(itemHeight, totalHeight - top);

		const chunk = await sim
			.clone()
			.extract({ left: 0, top, width: metadata.width, height })
			.toBuffer();
		await FUN_保存图片(chunk, `xq_${startNum}`, true);
		startNum++;
	}
	return startNum;
}
