import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { useLoadMaterial } from "#/lib/加载素材";
import { orpc } from "#/orpc/client";
import { MAButtonList } from "./ma-按钮列表";

export function MA_文件夹功能按钮() {
	const mutation = useMutation(
		orpc.ORPC_文件夹操作.mutationOptions({
			onSuccess: (ctx) => {
				toast(`${ctx.actionName} 操作成功`, {
					icon: <Info />,
					position: "top-center",
				});
			},
		}),
	);
	const loaderFolder = useLoadMaterial();

	const store = useMaterialStore();
	return (
		<div className="item-box">
			<h2 className="col-span-12">文件夹操作</h2>

			{MAButtonList.map((items, index) => (
				<div className="col-span-12" key={index.toString()}>
					{items.map((item) => (
						<Button
							key={item.name}
							onClick={async () => {
								if (item.confirm && !confirm("确定执行此操作吗？")) {
									return;
								}

								const res = await mutation.mutateAsync({
									actionName: item.name,
									rootPath: store.rootPath,
									shopName: store.shopName,
								});

								if (res.success) {
									await loaderFolder.mutateAsync({
										rootPath: store.rootPath,
										shopName: store.shopName,
									});
								}
							}}
							variant={item.confirm ? "destructive" : "default"}
						>
							{item.icon}
							{item.name}
						</Button>
					))}
				</div>
			))}
		</div>
	);
}
