import { useMutation } from "@tanstack/react-query";
import { ImagePlay } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { orpc } from "#/orpc/client";

export function MA_制作详情按钮() {
	const mutation = useMutation(orpc.ORPC_制作详情.mutationOptions());
	const makeDataImage = useMutation(orpc.ORPC_制作数据图.mutationOptions());
	const store = useMaterialStore();
	return (
		<Button
			onClick={async () => {
				const res = await makeDataImage.mutateAsync(
					[
						{
							name: "素材ID",
							content: store.serverResInfo.folderNav.currentStem,
						},
						{
							name: "素材格式",
							content: store.serverResInfo.materialFormatWithCount.formatTitle,
						},
						{
							name: "素材数量",
							content: store.serverResInfo.materialFormatWithCount.countTitle,
						},
						{
							name: "素材大小",
							content: store.serverResInfo.materialFormatWithCount.size,
						},
						{
							name: "发货方式",
							content: "本店仅支持百度网盘发货，不支持其他任何发送方式",
						},
						{
							name: "发货时间",
							content: "拍下后机器人全自动发货，全天候24小时发货。",
						},
					].concat(
						store.shopName === "泡泡素材"
							? [
									{
										name: "PSD须知",
										content: "此PSD素材不分层，购买前请知晓。",
									},
								]
							: [],
					),
				);

				if (res.success) {
					await mutation.mutateAsync({
						effectImageList: store.serverResInfo.effectImageList,
						previewImageList: store.serverResInfo.previewImageList,
						innerSpacing: store.xqOptions.innerSpacing,
						outerSpacing: store.xqOptions.outerSpacing,
						rows: store.xqOptions.rows,
						制作效果图: store.xqOptions.制作效果图,
						制作预览图: store.xqOptions.制作预览图,
						borderRadius: store.xqOptions.borderRadius,
					});
				}
			}}
		>
			<ImagePlay />
			制作详情
		</Button>
	);
}
