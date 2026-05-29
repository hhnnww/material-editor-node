import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { useMaterialStore } from "#/lib/use-material-edit-store";

export function MA_上下文件夹() {
	const store = useMaterialStore();
	const handPath = (newPath: string) => {
		useMaterialStore.setState((state) => {
			state.rootPath = newPath;
			state.serverResInfo = null as any;
		});
	};
	return (
		<ButtonGroup>
			<Button
				onClick={() => {
					handPath(store.serverResInfo.folderNav.prevPath);
				}}
			>
				<ArrowLeft />
				{store.serverResInfo.folderNav.prevStem} 上一个文件夹
			</Button>
			<Button
				onClick={() => {
					handPath(store.serverResInfo.folderNav.currentPath);
				}}
			>
				{store.serverResInfo.folderNav.currentStem}
			</Button>
			<Button
				onClick={() => {
					handPath(store.serverResInfo.folderNav.nextPath);
				}}
			>
				下一个文件夹 {store.serverResInfo.folderNav.nextStem} <ArrowRight />
			</Button>
		</ButtonGroup>
	);
}
