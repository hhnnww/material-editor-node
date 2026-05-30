import type { InferRouterInputs } from "@orpc/server";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { orpc } from "#/orpc/client";
import type { ORPC_文件夹操作 } from "#/orpc/router/orpc-文件夹操作";
import { useLoadRootPathMutation } from "../maf-load-root-path";
import { useMafStore } from "../store";
import { MAFButtonList } from "./maf-按钮列表";

export function MAF_文件夹操作() {
	const loadFolderMutation = useLoadRootPathMutation();
	const mutation = useMutation(
		orpc.ORPC_文件夹操作.mutationOptions({
			onSuccess: (ctx) => {
				toast(`${ctx.actionName} 操作成功`, {
					position: "top-center",
					icon: <CircleCheck />,
				});
			},
		}),
	);
	const form = useAppForm({
		defaultValues: {
			actionName: "",
			rootPath: "",
			shopName: "",
		} as InferRouterInputs<typeof ORPC_文件夹操作>,

		onSubmit: async (ctx) => {
			await mutation.mutateAsync(ctx.value);
			await loadFolderMutation.mutateAsync({
				rootPath: store.rootPath,
				shopName: store.shopName,
			});

			return true;
		},
	});
	const store = useMafStore();
	return (
		<div className="item-box">
			<h2 className="col-span-12">文件夹操作</h2>

			{MAFButtonList.map((items, index) => {
				return (
					<div className="col-span-12" key={index.toString()}>
						{items.map((item) => (
							<Button
								disabled={
									mutation.isPending &&
									form.getFieldValue("actionName") === item.name
								}
								variant={item.confirm ? "destructive" : "default"}
								key={item.name}
								onClick={async () => {
									if (item.confirm && !confirm(`确定要 ${item.name}`)) {
										return;
									}
									form.setFieldValue("actionName", item.name);
									form.setFieldValue("shopName", store.shopName);
									form.setFieldValue("rootPath", store.rootPath);
									await form.handleSubmit();
								}}
							>
								{mutation.isPending &&
								form.getFieldValue("actionName") === item.name ? (
									<Spinner />
								) : (
									item.icon
								)}
								{item.name}
							</Button>
						))}
					</div>
				);
			})}
		</div>
	);
}
