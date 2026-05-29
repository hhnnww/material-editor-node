import path from "node:path";

type output = {
	currentPath: string;
	currentStem: string;

	prevPath: string;
	prevStem: string;
	nextPath: string;
	nextStem: string;
};

export async function FUN_获取上下文件夹(rootPath: string) {
	/**
	 * 传入一个文件夹 F:\小夕素材\11000-11999\11825
	 * 计算上一个文件夹 F:\小夕素材\11000-11999\11824
	 * 计算下一个文件夹 F:\小夕素材\11000-11999\11826
	 * 并且分别获取他们的stem
	 * output格式返回
	 * 不需要验证文件夹是否存在
	 */
	const parentDir = path.dirname(rootPath);
	const currentStem = path.basename(rootPath);
	const currentNum = Number.parseInt(currentStem, 10);

	const prevStem = (currentNum - 1).toString();
	const nextStem = (currentNum + 1).toString();

	const prevPath = path.join(parentDir, prevStem);
	const nextPath = path.join(parentDir, nextStem);

	const result: output = {
		currentPath: rootPath,
		currentStem: currentStem,

		prevPath: prevPath,
		prevStem: prevStem,
		nextPath: nextPath,
		nextStem: nextStem,
	};

	return result;
}
