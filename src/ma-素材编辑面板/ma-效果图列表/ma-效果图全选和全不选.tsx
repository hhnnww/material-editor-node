import { CircleCheck, CircleMinus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { useMaterialStore } from "#/lib/use-material-edit-store";

export function MA_效果图全选和全不选() {
	return (
		<ButtonGroup>
			<Button
				onClick={() => {
					useMaterialStore.setState((state) => {
						if (state.serverResInfo) {
							state.stOptions.imageList =
								state.serverResInfo.effectImageList.map((item) => ({
									imagePath: item.imagePath,
									width: item.width,
									height: item.height,
									imageRatio: item.imageRatio,
								}));
						}
					});
				}}
			>
				<CircleCheck />
				效果图全选
			</Button>
			<Button
				onClick={() => {
					useMaterialStore.setState((state) => {
						if (state.serverResInfo) {
							const currentEffectPaths =
								state.serverResInfo.effectImageList.map(
									(item) => item.imagePath,
								);
							// 我修改了imagelist的格式这里也帮我修改一下
							state.stOptions.imageList = state.stOptions.imageList.filter(
								(item) => !currentEffectPaths.includes(item.imagePath),
							);
						}
					});
				}}
			>
				<CircleMinus />
				效果图全不选
			</Button>
		</ButtonGroup>
	);
}
