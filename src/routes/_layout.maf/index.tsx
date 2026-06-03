import { createFileRoute } from "@tanstack/react-router";
import { MAF_制作详情 } from "./-component/MAF_制作详情";
import { MAF_制作首图 } from "./-component/MAF_制作首图";
import { MAF_文件夹操作 } from "./-component/MAF_文件夹操作";
import { MAF_路径输入 } from "./-component/MAF_路径输入";
import { MAF_发布到淘宝 } from "./-component/maf-发布到淘宝";
import { useMafStore } from "./-component/store";

export const Route = createFileRoute("/_layout/maf/")({
	component: RouteComponent,
});

function RouteComponent() {
	const store = useMafStore();
	return (
		<>
			<MAF_路径输入 />

			{store.serverResInfo && (
				<>
					<MAF_文件夹操作 />
					<MAF_发布到淘宝 />
					<MAF_制作详情 />
					<MAF_制作首图 />
				</>
			)}
		</>
	);
}
