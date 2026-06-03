import { withForm } from "#/components/tanstack-form-component/create-form";
import { setting } from "#/setting";
import { useLoadRootPathMutation } from "../maf-load-root-path";
import { useMafStore } from "../store";
import { MAF_上下文件夹 } from "./maf-上下文件夹";
import { maf_路径输入表单参数 } from "./maf-路径输入-表单参数";

export const MAF_路径输入子表单 = withForm({
	...maf_路径输入表单参数,
	render: function Render({ form }) {
		const store = useMafStore();

		const mutation = useLoadRootPathMutation();

		const setPath = async (newPath: string) => {
			form.setFieldValue("rootPath", newPath);
			await mutation.mutateAsync({
				rootPath: newPath,
				shopName: useMafStore.getState().shopName,
			});
		};

		return (
			<form
				className="item-box"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<h2 className="col-span-12">路径输入</h2>

				<form.AppField name="shopName">
					{(field) => (
						<field.SelectField
							label="店铺名"
							col={2}
							options={setting.shopList}
						/>
					)}
				</form.AppField>

				<form.AppField name="rootPath">
					{(field) => <field.TextField label="路径" col={10} />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButtonField label="加载文件夹" />
				</form.AppForm>

				{store.serverResInfo && (
					<div className="col-span-12">
						<MAF_上下文件夹 handPath={setPath} />
					</div>
				)}
			</form>
		);
	},
});
