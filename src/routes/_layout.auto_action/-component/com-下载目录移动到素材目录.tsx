import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { orpc } from "#/orpc/client";
import { setting } from "#/setting";
import { useAutoAction } from "./auto-action-store";

export const COM_下载目录移动到素材目录 = () => {
	const mutation = useMutation(
		orpc.orpcMaterialAutoMake.mutationOptions({
			onSuccess: async (ctx) => {
				useAutoAction.setState((state) => {
					state.dstPath = form.getFieldValue("dstPath");
					state.firstNum = ctx.firstNum;
					state.shopName = form.getFieldValue("shopName");
				});
			},
		}),
	);

	const form = useAppForm({
		defaultValues: {
			shopName: "泡泡素材",
			oriPath: "F:\\DOWN\\xhs",
			dstPath: "F:\\泡泡素材\\3000-3999",
		},

		onSubmit: async (ctx) => {
			await mutation.mutateAsync(ctx.value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="item-box"
		>
			<h2 className="col-span-12">移动素材到素材文件夹</h2>
			<form.AppField name="shopName">
				{(field) => {
					return (
						<field.SelectField
							col={2}
							label="店铺选择"
							options={setting.shopList}
						/>
					);
				}}
			</form.AppField>

			<form.AppField name="oriPath">
				{(field) => <field.TextField col={5} label="下载文件夹" />}
			</form.AppField>

			<form.AppField name="dstPath">
				{(field) => <field.TextField col={5} label="素材文件夹" />}
			</form.AppField>

			<form.AppForm>
				<form.SubmitButtonField label="自动批处理" />
			</form.AppForm>
		</form>
	);
};
