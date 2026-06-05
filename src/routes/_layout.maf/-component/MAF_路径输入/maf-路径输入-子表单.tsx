import { withForm } from "#/components/tanstack-form-component/create-form";
import { Field, FieldLabel } from "#/components/ui/field";
import { setting } from "#/setting";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLoadRootPathMutation } from "../maf-load-root-path";
import { useMafStore } from "../store";
import { getLocalStorage } from "./fun-插入到本地数据库";
import { MAF_上下文件夹 } from "./maf-上下文件夹";
import { maf_路径输入表单参数 } from "./maf-路径输入-表单参数";

export const MAF_路径输入子表单 = withForm({
	...maf_路径输入表单参数,
	render: function Render({ form }) {
		const store = useMafStore();
		const rootPathList = getLocalStorage();
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
					{(field) => <field.TextField label="路径" col={8} />}
				</form.AppField>

				<div className="col-span-2">
					<Field>
						<FieldLabel>选择最近菜单</FieldLabel>
						<DropdownMenu>
							<DropdownMenuTrigger render={<Button variant="outline" />}>
								最近使用的路径
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{rootPathList?.map((item, index) => {
									return (
										<>
											<DropdownMenuGroup key={index.toString()}>
												<DropdownMenuLabel>{item.shopName}</DropdownMenuLabel>
												{item.rootPath.map((path, pathIndex) => {
													return (
														<DropdownMenuItem
															key={pathIndex.toString()}
															onClick={async () => {
																form.setFieldValue("rootPath", path);
																form.setFieldValue("shopName", item.shopName);
																await mutation.mutateAsync({
																	rootPath: path,
																	shopName: item.shopName,
																});
															}}
														>
															{path}
														</DropdownMenuItem>
													);
												})}
											</DropdownMenuGroup>
											<DropdownMenuSeparator />
										</>
									);
								})}
							</DropdownMenuContent>
						</DropdownMenu>
					</Field>
				</div>

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
