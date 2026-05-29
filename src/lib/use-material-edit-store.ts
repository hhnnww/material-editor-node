import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ORPC_制作详情 } from "#/orpc/router/orpc-制作详情";
import type { ORPC_制作首图 } from "#/orpc/router/orpc-制作首图";
import type { ORPC_加载素材 } from "#/orpc/router/orpc-加载素材";

interface State {
	shopName: string;
	rootPath: string;
	serverResInfo: InferRouterOutputs<typeof ORPC_加载素材>;
	stOptions: InferRouterInputs<typeof ORPC_制作首图>;
	xqOptions: InferRouterInputs<typeof ORPC_制作详情>;
	tbTitle: string;
}

export const useMaterialStore = create<State>()(
	immer(
		() =>
			({
				shopName: "",
				rootPath: "",
				tbTitle: "",
				stOptions: {
					title: "",
					imageList: [],
					rows: 3,
					innerSpacing: 0,
					outerSpacing: 0,
					style: "黑鲸",
					layout: "固定裁剪",
					borderRadius: 0,
					format: "",
					background: "#ffffff",
					currentStem: "",
					shopName: "",
					nameNum: 1,
				} as InferRouterInputs<typeof ORPC_制作首图>,

				xqOptions: {
					innerSpacing: 30,
					outerSpacing: 30,
					rows: 1,
					borderRadius: 20,
					制作效果图: "制作",
					制作预览图: "制作",
				},
			}) as State,
	),
);
