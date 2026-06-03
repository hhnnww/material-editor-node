import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { orpc } from "#/orpc/client.ts";
import { useMafStore } from "../store";
import { MAF_效果图列表 } from "./maf-制作首图-子表单-效果图列表.tsx";
import { MAF_预览图列表 } from "./maf-制作首图-子表单-预览图列表.tsx";
import { MAF_制作首图_子表单_首图信息 } from "./maf-制作首图-子表单-首图信息.tsx";
import { maf_制作首图_表单参数 } from "./maf-制作首图-表单参数";

export function MAF_制作首图() {
	const store = useMafStore();
	const mutation = useMutation(
		orpc.ORPC_制作首图.mutationOptions({
			onSuccess: () => {
				toast.info("制作首图成功", {
					position: "top-center",
					icon: <CircleCheck />,
				});
			},
		}),
	);

	const form = useAppForm({
		...maf_制作首图_表单参数,
		onSubmit: async (ctx) => {
			if (ctx.value.title === "") {
				alert("必须填写标题");
				return;
			}
			await mutation.mutateAsync(ctx.value);
		},
	});

	useEffect(() => {
		if (store.serverResInfo?.materialFormatWithCount.format) {
			form.setFieldValue(
				"format",
				store.serverResInfo?.materialFormatWithCount.format,
			);
			form.setFieldValue(
				"currentStem",
				store.serverResInfo.folderNav.currentStem,
			);
			form.setFieldValue("shopName", store.shopName);
			form.clearFieldValues("imageList");
			form.setFieldValue("title", "");
		}
	}, [store, form.setFieldValue, form.clearFieldValues]);

	return (
		<>
			<MAF_制作首图_子表单_首图信息 form={form} />
			{store.serverResInfo?.effectImageList && (
				<MAF_效果图列表
					form={form}
					effectImageList={store.serverResInfo?.effectImageList}
				/>
			)}

			{store.serverResInfo?.previewImageList && (
				<MAF_预览图列表
					form={form}
					previewImageList={store.serverResInfo?.previewImageList}
				/>
			)}
		</>
	);
}
