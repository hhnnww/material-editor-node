import sharp from "sharp";
import { setting } from "#/setting";
import { ST_制作黑鲸LOGO } from "./st-制作logo";
import { ST_黑鲸商家编码 } from "./st-黑鲸商家编码";
import { ST_黑鲸标题 } from "./st-黑鲸标题";
import { ST_黑鲸格式 } from "./st-黑鲸格式";

export async function RUN_制作黑鲸首图(props: {
	bg: Buffer<ArrayBufferLike>;
	title: string;
	format: string;
	background: string;
	shopName: string;
	currentStem: string;
}) {
	/**
	 * 根据width height创建透明大图
	 * 把bg粘贴到 left 0 top 0
	 * 然后把titleImage粘贴到 left 0 bottom 0
	 * 把 formatImage 粘贴到距离right 120 bottom 是titleImage的高度
	 */
	const width = setting.stWidth;
	const height = setting.stHeight;

	const logoImage = await ST_制作黑鲸LOGO(props.shopName);
	const titleImage = await ST_黑鲸标题({ title: props.title });
	const formatImage = await ST_黑鲸格式(props.format);
	const stemImage = await ST_黑鲸商家编码(props.currentStem);

	const titleMeta = await sharp(titleImage).metadata();
	const formatMeta = await sharp(formatImage).metadata();
	const stemMeta = await sharp(stemImage).metadata();
	const result = await sharp({
		create: {
			width: width,
			height: height,
			channels: 4,
			background: props.background,
		},
	})
		.composite([
			{ input: props.bg, left: 0, top: 0 },
			{ input: logoImage, left: 120, top: 0 },
			{ input: titleImage, left: 0, top: height - (titleMeta.height || 0) },
			{
				input: formatImage,
				left: width - (formatMeta.width || 0) - 140,
				top: height - (titleMeta.height || 0) - (formatMeta.height || 0) / 2,
			},
			{
				input: stemImage,
				left: width - stemMeta.width - 50,
				top: 50,
			},
		])
		.png()
		.toBuffer();

	return result;
}
