import type { InferRouterOutputs } from "@orpc/server";
import { useMutation } from "@tanstack/react-query";
import { ImageMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { useLoadMaterial } from "#/lib/加载素材";
import { orpc } from "#/orpc/client";
import type { ORPC_加载素材 } from "#/orpc/router/orpc-加载素材";

export function MA_预览图删除按钮(
	props: InferRouterOutputs<typeof ORPC_加载素材>["previewImageList"][number],
) {
	const deleteImageMutation = useMutation(
		orpc.ORPC_删除文件.mutationOptions({
			onSuccess: () => {
				toast("图片删除成功");
			},
		}),
	);
	const store = useMaterialStore();
	const loaderFolder = useLoadMaterial();
	return (
		<Button
			variant={"destructive"}
			onClick={async () => {
				if (confirm("确定删除吗")) {
					const res = await deleteImageMutation.mutateAsync([
						props.materialImagePath,
						props.imagePath,
						props.thumbPath,
					]);
					if (res) {
						await loaderFolder.mutateAsync({
							rootPath: store.rootPath,
							shopName: store.shopName,
						});
					}
				}
			}}
		>
			<ImageMinus />
			删除图片
		</Button>
	);
}
