import { exec } from "node:child_process";
import path from "node:path";
import { setting } from "#/setting";
import { FUN_递归遍历文件夹 } from "../fun-递归遍历文件夹";

export const FUN_复制效果图片到剪切板 = (props: { effectPath: string }) => {
	// 1. 获取文件夹下的所有图片路径列表
	const imageFileList = FUN_递归遍历文件夹(props.effectPath, setting.imageSuffixList);

	// 2. 安全检查
	if (!imageFileList || imageFileList.length === 0) {
		return { success: false, message: "未找到任何图片文件" };
	}

	// 3. 处理所有图片的路径：转为 Windows 标准绝对路径，并用逗号和单引号拼接成 PowerShell 数组格式
	// 格式化后类似于: 'C:\img1.png', 'C:\img2.png', 'C:\img3.png'
	const formattedPaths = imageFileList.map((filePath) => `'${path.resolve(filePath).replace(/\//g, "\\")}'`).join(", ");

	// 4. 异步调用 PowerShell 模拟资源管理器的“复制多文件”操作
	return new Promise((resolve) => {
		// 构建 PowerShell 脚本
		// [System.Collections.Specialized.StringCollection] 是 Windows 存储多文件路径的标准容器
		const powershellCommand =
			`powershell -ExecutionPolicy Bypass -Command "` +
			`[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); ` +
			`$fileList = New-Object System.Collections.Specialized.StringCollection; ` +
			`[void]$fileList.AddRange(@(${formattedPaths})); ` +
			`[System.Windows.Forms.Clipboard]::SetFileDropList($fileList);` +
			`"`;

		exec(powershellCommand, (error: any, _stdout: string, stderr: string) => {
			if (error || stderr) {
				console.error("复制多图到剪切板失败:", error || stderr);
				resolve({ success: false, message: stderr || error.message });
				return;
			}

			console.log(`成功将 ${imageFileList.length} 张图片文件复制到剪切板！`);
			resolve({
				success: true,
				message: `成功复制 ${imageFileList.length} 张图片，可直接在网页粘贴`,
			});
		});
	});
};
