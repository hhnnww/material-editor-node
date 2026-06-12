import { createFileRoute } from "@tanstack/react-router";
import { COM_下载目录移动到素材目录 } from "./-component/com-下载目录移动到素材目录";
import { COM_自动处理面板 } from "./-component/com-自动处理面板";
export const Route = createFileRoute("/_layout/auto_action/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col gap-20">
			<COM_下载目录移动到素材目录 />

			<COM_自动处理面板 />
		</div>
	);
}
