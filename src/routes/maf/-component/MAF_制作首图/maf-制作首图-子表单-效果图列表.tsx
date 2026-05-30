import { useMutation } from "@tanstack/react-query";
import { CircleCheck, CircleX, ImageMinus } from "lucide-react";
import { withForm } from "#/components/tanstack-form-component/create-form";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { orpc } from "#/orpc/client";
import { useLoadRootPathMutation } from "../maf-load-root-path";
import { useMafStore } from "../store";
import { maf_制作首图_表单参数 } from "./maf-制作首图-表单参数";

export const MAF_效果图列表 = withForm({
	...maf_制作首图_表单参数,
	props: {
		effectImageList: useMafStore.getState().serverResInfo?.effectImageList,
	},
	render: function Render({ form, effectImageList }) {
		const store = useMafStore();
		const loadRootPathMutation = useLoadRootPathMutation();
		const deleImageMutation = useMutation(
			orpc.ORPC_删除文件.mutationOptions({
				onSuccess: async () => {
					await loadRootPathMutation.mutateAsync({
						rootPath: store.rootPath,
						shopName: store.shopName,
					});
				},
			}),
		);
		return (
			<div className="item-box items-end">
				<h2 className="col-span-12">效果图列表</h2>
				<div className="col-span-12">
					<Button
						onClick={() => {
							const currentImages = form.getFieldValue("imageList") || [];
							effectImageList?.forEach((item) => {
								const exists = currentImages.some(
									(selected: { imagePath: string }) =>
										selected.imagePath === item.imagePath,
								);
								if (!exists) {
									form.pushFieldValue("imageList", item);
								}
							});
						}}
					>
						<CircleCheck />
						全选
					</Button>
					<Button
						onClick={() => {
							form.clearFieldValues("imageList");
						}}
					>
						<CircleX />
						清空
					</Button>
				</div>
				{effectImageList?.map((item) => {
					return (
						<form.Subscribe
							selector={(state) => state.values.imageList}
							key={item.imagePath}
						>
							{(child) => (
								<>
									<div className="flex flex-col items-start gap-2 col-span-2">
										<button
											type="button"
											onClick={() => {
												if (
													child.findIndex(
														(selected: { imagePath: string }) =>
															selected.imagePath === item.imagePath,
													) !== -1
												) {
													form.removeFieldValue(
														"imageList",
														child.findIndex(
															(selected) =>
																selected.imagePath === item.imagePath,
														),
													);
												} else {
													form.pushFieldValue("imageList", item);
												}
											}}
										>
											<img
												src={`/__local_disk_stream__/${item.thumbpath}`}
												alt={item.imagePath}
												className={`p-2 ${
													child.includes(item)
														? "bg-blue-500"
														: "bg-transparent"
												}`}
											/>
										</button>
										<Button
											disabled={
												deleImageMutation.isPending &&
												deleImageMutation.status.includes(item.imagePath)
											}
											onClick={async () => {
												if (!confirm("确定要删除吗")) return;
												const index = child.findIndex(
													(selected) => selected.imagePath === item.imagePath,
												);
												if (index > -1) {
													form.removeFieldValue("imageList", index);
												}
												return await deleImageMutation.mutateAsync([
													item.imagePath,
													item.thumbpath,
												]);
											}}
										>
											{deleImageMutation.isPending &&
											deleImageMutation.status.includes(item.imagePath) ? (
												<Spinner />
											) : (
												<ImageMinus />
											)}
											删除图片
										</Button>
									</div>
								</>
							)}
						</form.Subscribe>
					);
				})}
			</div>
		);
	},
});
