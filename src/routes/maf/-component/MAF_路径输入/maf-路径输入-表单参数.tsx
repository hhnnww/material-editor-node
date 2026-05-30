import type { InferRouterInputs } from "@orpc/server";
import { formOptions } from "@tanstack/react-form";
import type { ORPC_加载素材 } from "#/orpc/router/orpc-加载素材";

export const maf_路径输入表单参数 = formOptions({
	defaultValues: {
		shopName: "",
		rootPath: "",
	} as InferRouterInputs<typeof ORPC_加载素材>,
});
