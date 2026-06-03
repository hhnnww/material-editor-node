import type { InferRouterOutputs } from "@orpc/server";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ORPC_加载素材 } from "#/orpc/router/orpc-加载素材";

type mafStoreState = {
	rootPath: string;
	shopName: string;

	serverResInfo: InferRouterOutputs<typeof ORPC_加载素材> | null;
};

export const useMafStore = create<mafStoreState>()(
	immer(() => ({
		shopName: "",
		rootPath: "",
		serverResInfo: null,
	})),
);
