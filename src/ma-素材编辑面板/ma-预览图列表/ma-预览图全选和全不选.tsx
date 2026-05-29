import { CircleCheck, CircleMinus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { useMaterialStore } from "#/lib/use-material-edit-store";

export function MA_预览图全选和全不选() {
	return (
		<ButtonGroup>
			<Button
				onClick={() => {
					useMaterialStore.setState((state) => {
						if (state.serverResInfo) {
							const currentPaths = new Set(
								state.stOptions.imageList.map((img) => img.imagePath),
							);

							const newItems = state.serverResInfo.previewImageList
								.filter((item) => !currentPaths.has(item.imagePath))
								.map((item) => ({
									imagePath: item.imagePath,
									width: item.width,
									height: item.height,
									imageRatio: item.imageRatio,
								}));

							state.stOptions.imageList = [
								...state.stOptions.imageList,
								...newItems,
							];
						}
					});
				}}
			>
				<CircleCheck />
				预览图全选
			</Button>
			<Button
				onClick={() => {
					useMaterialStore.setState((state) => {
						if (state.serverResInfo) {
							const currentEffectPaths =
								state.serverResInfo.previewImageList.map(
									(item) => item.imagePath,
								);
							state.stOptions.imageList = state.stOptions.imageList.filter(
								(item) => !currentEffectPaths.includes(item.imagePath),
							);
						}
					});
				}}
			>
				<CircleMinus />
				预览图全不选
			</Button>
		</ButtonGroup>
	);
}
