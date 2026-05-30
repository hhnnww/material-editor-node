import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { useLoadRootPathMutation } from "../maf-load-root-path";
import { useMafStore } from "../store";
import { MAF_路径输入子表单 } from "./maf-路径输入-子表单";
import { maf_路径输入表单参数 } from "./maf-路径输入-表单参数";

export function MAF_路径输入() {
	const loaderRootPathMutation = useLoadRootPathMutation();
	const form = useAppForm({
		...maf_路径输入表单参数,
		onSubmit: async (ctx) => {
			useMafStore.setState((state) => {
				state.shopName = ctx.value.shopName;
			});

			return await loaderRootPathMutation.mutateAsync({
				rootPath: ctx.value.rootPath,
				shopName: ctx.value.shopName,
			});
		},
	});

	return <MAF_路径输入子表单 form={form} />;
}
