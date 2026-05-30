import { useMutation } from "@tanstack/react-query";
import { orpc } from "#/orpc/client";
import { useMafStore } from "./store";

export const useLoadRootPathMutation = () => {
	return useMutation(
		orpc.ORPC_加载素材.mutationOptions({
			onSuccess: async (ctx) => {
				useMafStore.setState((state) => {
					state.serverResInfo = ctx;
					state.rootPath = state.serverResInfo.folderNav.currentPath;
				});
			},
		}),
	);
};
