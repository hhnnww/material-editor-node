import type { InferRouterInputs } from "@orpc/server";
import { formOptions } from "@tanstack/react-form";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";

export const maf_详情表单参数 = formOptions({
	defaultValues: {
		borderRadius: 20,
		effectImageList: [],
		innerSpacing: 20,
		outerSpacing: 20,
		previewImageList: [],
		rows: 2,
		制作效果图: "制作",
		制作预览图: "制作",
	} as unknown as InferRouterInputs<typeof ORPC_制作详情>,
});
