import type { InferRouterInputs } from "@orpc/server";
import { formOptions } from "@tanstack/react-form";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";

export const maf_制作首图_表单参数 = formOptions({
	defaultValues: {
		title: "",
		style: "黑鲸",
		layout: "ST_固定裁剪",

		format: "",
		currentStem: "",
		shopName: "",
		background: "#ffffff",
		borderRadius: 0,
		innerSpacing: 0,
		outerSpacing: 0,
		nameNum: 1,
		imageList: [],
		rows: 3,
	} as unknown as InferRouterInputs<typeof ORPC_制作首图>,
});
