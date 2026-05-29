import { useMutation } from "@tanstack/react-query";
import { ImagePlay } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { orpc } from "#/orpc/client";

export function MA_制作首图按钮() {
	const store = useMaterialStore();
	const mutation = useMutation(orpc.ORPC_制作首图.mutationOptions());
	return (
		<Button
			onClick={() => {
				if (store.stOptions.imageList.length === 0) {
					alert("必须选择图片");
					return;
				}
				if (store.stOptions.title === "") {
					alert("必须填写标题");
					return;
				}
				mutation.mutate({
					...store.stOptions,
					shopName: store.shopName,
					currentStem: store.serverResInfo.folderNav.currentStem,
				});
			}}
		>
			<ImagePlay />
			制作首图
		</Button>
	);
}
