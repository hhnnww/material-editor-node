import path from "node:path";

export function FUN_验证文件夹(rootPath: string): {
	success: boolean;
	message: string;
} {
	/**
	 * 我是windows系统
	 * 1,判断文件夹是否是绝对路径，如果不是返回false
	 * 2，判断文件夹的stem和父stem是否相同，相同返回false
	 * 3,判断路径深度是否大于等于3，否则返回false
	 * 4，判断路径stem是否包含字符-，否则返回false
	 */
	// 1. 判断是否是绝对路径
	if (!path.isAbsolute(rootPath)) {
		console.log("验证失败: 路径必须是绝对路径");
		return { success: false, message: "路径必须是绝对路径" };
	}

	const normalizedPath = path.normalize(rootPath);
	const parts = normalizedPath.split(path.sep).filter((p) => p.length > 0);
	console.log("路径分段:", parts);

	// 3. 判断路径深度是否大于等于3 (例如 C:\Users\Name 为 3层)
	if (parts.length < 3) {
		return { success: false, message: "路径深度必须大于等于3" };
	}

	const stem = parts[parts.length - 1];
	const parentStem = parts[parts.length - 2];

	// 2. 判断文件夹的stem和父stem是否相同
	if (stem === parentStem) {
		console.log("验证失败: 当前文件夹名称不能与父文件夹名称相同");
		return {
			success: false,
			message: "当前文件夹名称不能与父文件夹名称相同",
		};
	}

	// 4. 判断路径stem是否包含字符-
	if (stem.includes("-")) {
		console.log("验证失败: 文件夹名称必须包含字符 '-'");
		return { success: false, message: "文件夹名称必须包含字符 '-'" };
	}

	console.log("验证通过");
	return {
		success: true,
		message: "验证通过",
	};
}
