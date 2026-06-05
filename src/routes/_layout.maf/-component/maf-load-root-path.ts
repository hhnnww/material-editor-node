import { useMutation } from "@tanstack/react-query";
import { orpc } from "#/orpc/client";
import { insertToLocalStorage } from "./MAF_路径输入/fun-插入到本地数据库";
import { useMafStore } from "./store";

export const useLoadRootPathMutation = () => {
	return useMutation(
		orpc.ORPC_加载素材.mutationOptions({
			onSuccess: (ctx) => {
				insertToLocalStorage({
					rootPath: ctx.rootPath,
					shopName: ctx.shopName,
				});

				useMafStore.setState((state) => {
					state.serverResInfo = ctx;
					state.rootPath = ctx.rootPath;
					state.shopName = ctx.shopName;
				});
			},
		}),
	);
};
