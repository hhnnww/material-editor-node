import {
	ArrowUpToLine,
	FileXCorner,
	FolderArchive,
	FolderInput,
	FolderOpen,
	FolderSync,
	ImageOff,
	ImagePlay,
	ImagePlus,
	ImageUp,
} from "lucide-react";

export const MAFButtonList = [
	[
		{ name: "打开素材文件夹", icon: <FolderOpen />, confirm: false },
		{ name: "打开桌面上传文件夹", icon: <FolderOpen />, confirm: false },
		{ name: "打开小夕素材大目录", icon: <FolderOpen />, confirm: false },
		{ name: "打开泡泡素材大目录", icon: <FolderOpen />, confirm: false },
		{ name: "打开饭桶设计大目录", icon: <FolderOpen />, confirm: false },
	],
	[
		{ name: "移动到根目录", icon: <ArrowUpToLine />, confirm: false },
		{ name: "解压ZIP", icon: <FolderArchive />, confirm: false },
		{ name: "删除广告文件", icon: <FileXCorner />, confirm: false },
		{
			name: "文件重命名",
			icon: <FolderSync />,
			confirm: false,
		},
	],
	[
		{ name: "子目录内容移动到根", icon: <ArrowUpToLine />, confirm: false },
		{ name: "子目录重命名", icon: <FolderSync />, confirm: false },
		{ name: "享设计文件夹重构", icon: <FolderInput />, confirm: false },
		{ name: "子文件夹源文件重命名", icon: <FolderSync />, confirm: false },
		{ name: "子目录图片重命名", icon: <ImagePlay />, confirm: false },
		{ name: "享设计制作预览图", icon: <ImagePlus />, confirm: false },
	],
	[
		{ name: "AI导出图片", icon: <ImagePlus />, confirm: false },
		{ name: "AI导出图片-插入广告", icon: <ImagePlus />, confirm: false },
		{ name: "打开没有预览图的AI文件", icon: <ImageUp />, confirm: false },
	],
	[
		{ name: "PSD导出图片", icon: <ImagePlay />, confirm: false },
		{ name: "PSD导出图片—插入广告", icon: <ImagePlay />, confirm: false },
		{ name: "图片转PSD", icon: <ImagePlay />, confirm: false },
		{ name: "打开没有预览图的PSD文件", icon: <ImagePlay />, confirm: false },
	],
	[{ name: "PPT导出图片", icon: <ImagePlay />, confirm: false }],
	[
		{ name: "复制到预览图", icon: <ImagePlus />, confirm: false },
		{ name: "移动到效果图", icon: <ImageUp />, confirm: false },
	],
	[
		{ name: "删除素材文件夹内所有图片", icon: <ImageOff />, confirm: true },
		{ name: "删除预览图", icon: <ImageOff />, confirm: true },
		{ name: "删除效果图", icon: <ImageOff />, confirm: true },
	],
];
