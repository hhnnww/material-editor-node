import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import type { fontWeight } from "#/setting";

const textImageCache = new Map<string, Buffer>();

export const makeTextImage = async (props: { text: string; width?: number; height?: number; fontWeight: fontWeight; fillColor: string }) => {
	const cacheKey = `${props.text}_w:${props.width || ""}_h:${props.height || ""}_fw:${props.fontWeight}_c:${props.fillColor}`;
	const cached = textImageCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const fontFolderPath = "public/ibm-plex-sans";
	const fontAbsoluteFilePath = path.resolve(process.cwd(), fontFolderPath, `IBMPlexSansSC-${props.fontWeight}.ttf`);

	if (!fs.existsSync(fontAbsoluteFilePath)) {
		throw new Error(`找不到字体文件，请检查路径是否正确: ${fontAbsoluteFilePath}`);
	}

	// 1. 定义一个足够大的虚拟画布，确保长文本不会被截断
	// 这里的尺寸不影响最终输出，因为后面 sharp().trim() 会把白边切掉
	const fontSize = 300;
	const virtualWidth = Math.ceil(props.text.length * 1.5 * fontSize);
	const virtualHeight = fontSize * 2;

	// 2. 构造现代 SVG 字符串
	// 配合 dominant-baseline="central" 和 text-anchor="middle" 让文字天然居中
	const svg = `
        <svg width="${virtualWidth}" height="${virtualHeight}" xmlns="http://www.w3.org/2000/svg">
            <style>
                @font-face {
                    font-family: 'IBMPlexSansSC';
                    src: url('${fontAbsoluteFilePath}');
                }
                .text-style {
                    font-family: 'IBMPlexSansSC';
                    font-size: ${fontSize}px;
                    fill: ${props.fillColor || "#000000"};
                }
            </style>
            <rect width="100%" height="100%" fill="none"/>
            <text 
                x="${virtualWidth / 2}" 
                y="${virtualHeight / 2}" 
                dominant-baseline="central" 
                text-anchor="middle" 
                class="text-style"
            >${props.text}</text>
        </svg>`;

	// 3. 使用 resvg-js 进行高速底层渲染
	const resvg = new Resvg(svg, {
		font: {
			fontFiles: [fontAbsoluteFilePath], // 加载当前指定的具体粗细字体
			loadSystemFonts: false, // 禁用系统字体，极大提升加载性能
			defaultFontFamily: "IBMPlexSansSC",
		},
	});

	const resvgBuffer = resvg.render().asPng();

	// 4. 扔给 sharp：.trim() 会自动精确裁剪掉四周所有的透明白边
	const imagePipeline = sharp(resvgBuffer).trim();

	// 5. 根据出参要求缩放到指定的宽高
	let resultBuffer: Buffer;
	if (props.width) {
		resultBuffer = await imagePipeline.resize({ width: props.width }).png().toBuffer();
	} else {
		resultBuffer = await imagePipeline.resize({ height: props.height }).png().toBuffer();
	}

	textImageCache.set(cacheKey, resultBuffer);
	return resultBuffer;
};
