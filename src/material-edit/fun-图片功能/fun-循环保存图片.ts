import sharp from "sharp";
import { FUN_保存图片 } from "./fun-保存图片";

export async function FUN_循环保存图片(
	im: Buffer<ArrayBufferLike>,
	startNum: number,
) {
	const itemHeight = 2000;

	// 💡 优化点 1：只初始化一次 Sharp 实例并预载入数据
	const basePipeline = sharp(im);
	const metadata = await basePipeline.metadata();

	const totalHeight = metadata.height || 0;
	const width = metadata.width || 0;
	const parts = Math.ceil(totalHeight / itemHeight);

	console.log(`[长图切片] 总高度: ${totalHeight}, 分片数量: ${parts}`);

	// 💡 优化点 2：放弃无脑 Promise.all，采用高效率的线性循环
	// 配合管道克隆，既省内存又快，完全省去了重复解压大图的 CPU 开销
	for (let i = 0; i < parts; i++) {
		const top = i * itemHeight;
		const height = Math.min(itemHeight, totalHeight - top);
		const currentStart = startNum + i;

		try {
			// 💡 优化点 3：使用 .clone() 派生当前切片，免去重新解码 im 的成本
			const chunk = await basePipeline
				.clone()
				.extract({ left: 0, top, width, height })
				.png() // 或者 .jpeg()，根据你原图或需要的格式固定，显式声明编码更快
				.toBuffer();

			// 等待当前分片写入硬盘后再切下一片，保护硬盘 I/O 和内存
			await FUN_保存图片(chunk, `xq_${currentStart}`, true);
		} catch (error) {
			console.error(
				`[长图切片] 切割或保存第 ${i} 片 (xq_${currentStart}) 失败:`,
				error,
			);
		}
	}

	return startNum + parts;
}
