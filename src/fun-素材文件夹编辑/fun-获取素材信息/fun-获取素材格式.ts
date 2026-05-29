import fs from "node:fs";
import path from "node:path";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

type output = {
	format: string;
	count: number;
	size: string;
	formatTitle: string;
	countTitle: string;
};

const formatTitleMap: Record<string, string> = {
	psd: "PSD分层设计素材",
	ai: "AI矢量设计素材",
	ppt: "PPT幻灯片素材",
	pptx: "PPT幻灯片素材",
	jpg: "JPG大图素材",
	png: "PNG大图素材",
};

export function FUN_获取素材格式(materialPath: string): output {
	const formatSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const fileList = FUN_递归遍历文件夹(materialPath);
	const materialSuffixList = setting.materialSuffixList;

	const stats: Record<string, number> = {};
	const sizeStats: Record<string, number> = {};

	for (const file of fileList) {
		const ext = path.extname(file).toLowerCase().replace(".", "");
		if (!ext) continue;
		stats[ext] = (stats[ext] || 0) + 1;
		try {
			const fileSize = fs.statSync(file).size;
			sizeStats[ext] = (sizeStats[ext] || 0) + fileSize;
		} catch (e) {}
	}

	const totalImageCount = Object.entries(stats)
		.filter(([ext]) => setting.imageSuffixList.includes(`.${ext}`))
		.reduce((acc, [_, count]) => acc + count, 0);

	// 1. 如果有ai文件并且ai文件大于5，则返回ai
	if ((stats.ai || 0) >= 5) {
		const countTitle =
			totalImageCount > 0
				? `${stats.ai}个AI文件 + ${totalImageCount}张预览图`
				: `${stats.ai}个AI文件`;
		return {
			count: stats.ai,
			format: "ai",
			size: formatSize(sizeStats.ai || 0),
			formatTitle: formatTitleMap.ai || "ai矢量设计素材",
			countTitle,
		};
	}

	// 2. 统计素材源文件格式 (在 materialSuffixList 中的)
	const materialStats = Object.entries(stats)
		.filter(([ext]) => materialSuffixList.includes(`.${ext}`))
		.sort((a, b) => b[1] - a[1]);

	if (materialStats.length > 0) {
		const mainExt = materialStats[0][0];
		const mainCount = materialStats[0][1];
		const countTitle =
			totalImageCount > 0
				? `${mainCount}个${mainExt.toUpperCase()}文件 + ${totalImageCount}张预览图`
				: `${mainCount}个${mainExt.toUpperCase()}文件`;
		return {
			count: mainCount,
			format: mainExt,
			size: formatSize(sizeStats[mainExt] || 0),
			formatTitle:
				formatTitleMap[mainExt] || `${mainExt.toUpperCase()}设计素材`,
			countTitle,
		};
	}

	// 3. 如果没有素材源文件，返回图片最多的格式
	const imageStats = Object.entries(stats)
		.filter(([ext]) => setting.imageSuffixList.includes(`.${ext}`))
		.sort((a, b) => b[1] - a[1]);

	if (imageStats.length > 0) {
		return {
			count: imageStats[0][1],
			format: imageStats[0][0],
			size: formatSize(sizeStats[imageStats[0][0]] || 0),
			formatTitle: `${imageStats[0][0].toUpperCase()}高清图片素材`,
			countTitle: `${imageStats[0][1]}个${imageStats[0][0].toUpperCase()}文件`,
		};
	}

	return { count: 0, format: "", size: "0 B", formatTitle: "", countTitle: "" };
}
