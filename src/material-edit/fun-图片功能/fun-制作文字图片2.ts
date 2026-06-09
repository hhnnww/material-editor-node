import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");

export const makeTextImage = async (props: {
	text: string;
	width?: number;
	height?: number;
	fontWeight:
		| "Thin"
		| "ExtraLight"
		| "Light"
		| "Regular"
		| "Text"
		| "Medium"
		| "SemiBold"
		| "Bold";
	fillColor: string;
}) => {
	const fontFolderPath = "public/ibm-plex-sans";
	const fontAbsoluteFilePath = path.resolve(
		process.cwd(),
		fontFolderPath,
		`IBMPlexSansSC-${props.fontWeight}.ttf`,
	);

	if (!fs.existsSync(fontAbsoluteFilePath)) {
		throw new Error(
			`找不到字体文件，请检查路径是否正确: ${fontAbsoluteFilePath}`,
		);
	}

	const _opentype = (opentype as any).default || opentype;
	const fileBuffer = fs.readFileSync(fontAbsoluteFilePath);
	const font = _opentype.parse(
		fileBuffer.buffer.slice(
			fileBuffer.byteOffset,
			fileBuffer.byteOffset + fileBuffer.byteLength,
		),
	);

	const fontSize = 1000;
	const text = props.text;

	// 1.5 获取精确的边界框以修正宽度
	const bbox = font.getPath(text, 0, 0, fontSize).getBoundingBox();

	// 2. 计算画布尺寸 (使用 bbox 确保宽度包含所有笔画，高度基于度量值)
	const width = Math.ceil(bbox.x2 - bbox.x1);
	const height = Math.ceil(bbox.y2 - bbox.y1);

	// 3. 计算基线位置 (y 坐标)
	const x = -bbox.x1;
	const y = -bbox.y1;

	const svgPath = font.getPath(text, x, y, fontSize).toSVG(2);

	const svg = `
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
			<g fill="${props.fillColor || "black"}">${svgPath}</g>
		</svg>`;

	if (props.width) {
		return await sharp(Buffer.from(svg))
			.resize({ width: props.width })
			.trim()
			.png()
			.toBuffer();
	}
	return await sharp(Buffer.from(svg))
		.resize({ height: props.height })
		.trim()
		.png()
		.toBuffer();
};
