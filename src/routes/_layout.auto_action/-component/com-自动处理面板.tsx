import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { orpc } from "#/orpc/client";
import { setting } from "#/setting";
import { useAutoAction } from "./auto-action-store";

export const COM_自动处理面板 = () => {
	const getAllFolders = useMutation(
		orpc.orpc_获取所有目录列表.mutationOptions(),
	);
	const materialAction = useMutation(orpc.ORPC_文件夹操作.mutationOptions());
	const form = useAppForm({
		defaultValues: {
			shopName: "",
			firstNum: 0,
			dstPath: "",
		},

		onSubmit: async (ctx) => {
			const allFolders = await getAllFolders.mutateAsync({
				dstPath: ctx.value.dstPath,
				firstNum: ctx.value.firstNum,
			});

			const actionList = ["移动到根目录", "移动到效果图"];
			for (const rootPath of allFolders) {
				for (const action of actionList) {
					materialAction.mutateAsync({
						actionName: action,
						rootPath: rootPath.fullPath,
						shopName: form.getFieldValue("shopName"),
					});
				}
			}
			console.log(allFolders);
		},
	});
	const store = useAutoAction();

	useEffect(() => {
		form.setFieldValue("shopName", store.shopName);
		form.setFieldValue("firstNum", store.firstNum);
		form.setFieldValue("dstPath", store.dstPath);
	}, [store.shopName, form.setFieldValue, store.firstNum, store.dstPath]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="item-box"
		>
			<h2 className="col-span-12">素材自动处理</h2>
			<form.AppField name="shopName">
				{(field) => (
					<field.SelectField col={2} label="店铺" options={setting.shopList} />
				)}
			</form.AppField>

			<form.AppField name="firstNum">
				{(field) => (
					<field.TextField col={2} label="第一个文件夹" type="number" />
				)}
			</form.AppField>

			<form.AppField name="dstPath">
				{(field) => <field.TextField col={8} label="目标文件夹" />}
			</form.AppField>

			<form.AppForm>
				<form.SubmitButtonField label="自动处理" />
			</form.AppForm>
		</form>
	);
};
