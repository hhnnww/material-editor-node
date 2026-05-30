import type { InferRouterInputs } from "@orpc/server";
import sharp, { type OverlayOptions } from "sharp";
import { FUN_制作文字图片 } from "#/material-edit/fun-图片功能/fun-制作文字图片";
import type { ORPC_制作数据图 } from "#/orpc/router/orpc-制作数据图";
import { setting } from "#/setting";
import { XQ_制作标题 } from "./xq-制作标题";

export async function XQ_制作数据图(
	props: InferRouterInputs<typeof ORPC_制作数据图>,
) {
	/**
	 * 制作一个数据表格图片
	 * 左边name右边content
	 * 宽度是width
	 */
	const width = setting.xqWidth;
	const titleImg = await XQ_制作标题({
		title: "素材信息",
		desc: "加入会员，全店可用",
	});

	const titleMeta = await sharp(titleImg).metadata();

	const composites: OverlayOptions[] = [];
	composites.push({ input: titleImg, top: 0, left: 0 });

	const borderRadius = 30;
	const paddingX = 50;
	const rowHeight = 260;
	const nameWidth = 500;
	let currentY = titleMeta.height || 0;

	const tableStartY = currentY;

	for (let i = 0; i < props.length; i++) {
		const item = props[i];

		const tableWidth = width - paddingX * 2;
		const isLast = i === props.length - 1;
		const isFirst = i === 0;

		// 制作行背景（双数行灰色，单数行透明，处理圆角）
		const rowBgColor = i % 2 === 1 ? "#f7f7f7" : "transparent";

		// 处理圆角：第一行顶部圆角，最后一行如果是双数行（有背景色）则需要底部圆角
		const topRadius = isFirst ? borderRadius : 0;
		const bottomRadius = isLast && i % 2 === 1 ? borderRadius : 0;

		const rowBg = Buffer.from(`
			<svg width="${tableWidth}" height="${rowHeight}">
				<path d="
					M ${topRadius},0 
					H ${tableWidth - topRadius} Q ${tableWidth},0 ${tableWidth},${topRadius} 
					V ${rowHeight - bottomRadius} Q ${tableWidth},${rowHeight} ${tableWidth - bottomRadius},${rowHeight} 
					H ${bottomRadius} Q 0,${rowHeight} 0,${rowHeight - bottomRadius} 
					V ${topRadius} Q 0,0 ${topRadius},0 Z" 
					fill="${rowBgColor}" />
			</svg>
		`);

		composites.push({
			input: rowBg,
			top: currentY,
			left: paddingX,
		});

		const fontSize = 57;
		// 制作名称文字
		const nameImg = await FUN_制作文字图片({
			text: item.name,
			fontSize: fontSize,
			fontWidth: "Light",
			fillColor: "#666",
		});
		const nameMeta = await sharp(nameImg).metadata();

		composites.push({
			input: nameImg,
			top: currentY + Math.floor((rowHeight - (nameMeta.height || 0)) / 2),
			left: paddingX + 100,
		});

		// 制作内容文字
		const contentImg = await FUN_制作文字图片({
			text: item.content,
			fontSize: fontSize,
			fontWidth: "Light",
			fillColor: "#666",
		});
		const contentMeta = await sharp(contentImg).metadata();

		composites.push({
			input: contentImg,
			top: currentY + Math.floor((rowHeight - (contentMeta.height || 0)) / 2),
			left: paddingX + nameWidth,
		});

		currentY += rowHeight;
	}

	const tableHeight = currentY - tableStartY;
	const tableWidth = width - paddingX * 2;

	// 绘制外部圆角矩形边框
	const borderSvg = Buffer.from(`
		<svg width="${tableWidth}" height="${tableHeight}">
			<rect x="0" y="0" width="${tableWidth}" height="${tableHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="none" stroke="#efefef" stroke-width="2" />
		</svg>
	`);

	composites.push({
		input: borderSvg,
		top: tableStartY,
		left: paddingX,
	});

	// 底部留白
	const totalHeight = currentY + 200;

	// 绘制整体背景
	const finalImg = await sharp({
		create: {
			width: width,
			height: totalHeight,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	})
		.composite([...composites])
		.png()
		.toBuffer();

	return finalImg;
}
