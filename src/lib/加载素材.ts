import { useMutation } from "@tanstack/react-query";
import { orpc } from "#/orpc/client";
import { useMaterialStore } from "./use-material-edit-store";

/**
 * 封装加载素材的 Hook
 * 调用返回的 mutate 方法即可发起请求并自动更新 Store
 */
export function useLoadMaterial() {
	return useMutation(
		orpc.ORPC_加载素材.mutationOptions({
			onSuccess: (data) => {
				// 请求成功后，将数据同步到 Zustand Store
				useMaterialStore.setState((state) => {
					state.serverResInfo = data;
					state.stOptions.format = data.materialFormatWithCount.format;
					state.stOptions.imageList = [];
					state.stOptions.title = "";
					state.tbTitle = data.folderNav.currentStem;
					state.stOptions.nameNum = 1;
				});
			},
			onError: (error) => {
				console.error("加载素材失败:", error);
			},
		}),
	);
}
