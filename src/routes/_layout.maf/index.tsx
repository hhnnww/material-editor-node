import { createFileRoute } from "@tanstack/react-router";
import { MAF_制作详情 } from "./-component/MAF_制作详情";
import { MAF_制作首图 } from "./-component/MAF_制作首图";
import { MafFolderOperations } from "./-component/MAF_文件夹操作";
import { MafMaterialInfo } from "./-component/MAF_素材信息";
import { MAF_路径输入 } from "./-component/MAF_路径输入";
import { MafPublishToTaobao } from "./-component/maf-发布到淘宝";
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
					<MafFolderOperations />
					<MafPublishToTaobao />
					<MafMaterialInfo />
					<MAF_制作详情 />
					<MAF_制作首图 />
				</>
			)}
		</>
	);
}
