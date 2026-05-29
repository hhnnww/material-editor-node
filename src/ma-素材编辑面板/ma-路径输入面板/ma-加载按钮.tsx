import { SquareArrowOutUpRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { useLoadMaterial } from "#/lib/加载素材";

export function MA_加载按钮() {
	const store = useMaterialStore();
	const loaderMaterial = useLoadMaterial();
	return (
		<Button
			onClick={async () =>
				await loaderMaterial.mutateAsync({
					rootPath: store.rootPath,
					shopName: store.shopName,
				})
			}
		>
			<SquareArrowOutUpRight />
			加载文件夹
		</Button>
	);
}
