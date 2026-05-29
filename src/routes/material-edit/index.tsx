import { createFileRoute } from "@tanstack/react-router";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { MA_制作详情 } from "#/ma-素材编辑面板/ma-制作详情";
import { MA_制作首图 } from "#/ma-素材编辑面板/ma-制作首图";
import { MA_发布到淘宝 } from "#/ma-素材编辑面板/ma-发布到淘宝";
import { MA_效果图列表 } from "#/ma-素材编辑面板/ma-效果图列表";
import { MA_文件夹功能按钮 } from "#/ma-素材编辑面板/ma-文件夹功能按钮";
import { MA_路径和店铺输入框 } from "#/ma-素材编辑面板/ma-路径输入面板";
import { MA_预览图列表 } from "#/ma-素材编辑面板/ma-预览图列表";

export const Route = createFileRoute("/material-edit/")({
	component: RouteComponent,
});

function RouteComponent() {
	const store = useMaterialStore();
	return (
		<div className="flex flex-col gap-20 p-10">
			<MA_路径和店铺输入框 />

			{store.serverResInfo && (
				<>
					<MA_文件夹功能按钮 />
					<MA_发布到淘宝 />
					<MA_制作首图 />
					<MA_制作详情 />
					<MA_效果图列表 />
					<MA_预览图列表 />
				</>
			)}
		</div>
	);
}
