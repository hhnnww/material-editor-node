import { createFileRoute } from "@tanstack/react-router";
import { MAF_制作详情 } from "./-component/MAF_制作详情";
import { MAF_制作首图 } from "./-component/MAF_制作首图";
import { MAF_文件夹操作 } from "./-component/MAF_文件夹操作";
import { MAF_路径输入 } from "./-component/MAF_路径输入";
import { useMafStore } from "./-component/store";

export const Route = createFileRoute("/maf/")({
	component: RouteComponent,
});

function RouteComponent() {
	const store = useMafStore();
	return (
		<div className="p-20 flex flex-col gap-20">
			<MAF_路径输入 />

			{store.serverResInfo && (
				<>
					<MAF_文件夹操作 />
					<MAF_制作详情 />
					<MAF_制作首图 />
				</>
			)}
		</div>
	);
}
