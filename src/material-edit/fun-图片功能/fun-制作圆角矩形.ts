import sharp from "sharp";

export const IMAGE_制作圆角矩形 = async (props: {
	width: number;
	height: number;
	borderRadius: number;
	fillColor: string;
}) => {
	const { width, height, borderRadius, fillColor } = props;

	const svgRect = Buffer.from(
		`<svg width="${width}" height="${height}">
			<rect x="0" y="0" width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" fill="${fillColor}" />
		</svg>`,
	);

	return await sharp(svgRect).png().toBuffer();
};
