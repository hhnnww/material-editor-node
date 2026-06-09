import sharp from "sharp";
import { setting } from "#/setting";
import { ST_制作圆圈 } from "./st-制作圆圈";
import { ST_制作标题栏 } from "./st-制作标题栏";

export const RUN_制作T500首图 = async (props: {
	bg: Buffer<ArrayBufferLike>;
	title: string;
	format: string;
	background: string;
	shopName: string;
	currentStem: string;
}) => {
	const width = setting.stWidth;
	const height = setting.stHeight;

	let formatTitle: string = "";
	if (props.format === "psd") {
		formatTitle = "PSD 分层设计素材";
	} else if (props.format === "ai") {
		formatTitle = "AI 矢量设计素材";
	}
	const titleBuffer = await ST_制作标题栏({
		title: props.title,
		formatTitle: formatTitle,
		adText: "全元素可编辑 全自动秒发货",
	});

	const circleBuffer = await ST_制作圆圈({
		shopName: props.shopName,
		materialID: props.currentStem,
	});

	const titleMeta = await sharp(titleBuffer).metadata();
	const circleMeta = await sharp(circleBuffer).metadata();

	const resizedBg = await sharp(props.bg).resize(width, height).toBuffer();

	return await sharp({
		create: {
			width: width,
			height: height,
			channels: 4,
			background: props.background,
		},
	})
		.composite([
			{ input: resizedBg, left: 0, top: 0 },
			{
				input: circleBuffer,
				left: Math.round((width - (circleMeta.width || 0)) / 2),
				top: Math.round((height - (circleMeta.height || 0)) / 2),
			},
			{
				input: titleBuffer,
				left: Math.round((width - (titleMeta.width || 0)) / 2),
				top: Math.round((height - (titleMeta.height || 0)) / 2),
			},
		])
		.png()
		.toBuffer();
};
