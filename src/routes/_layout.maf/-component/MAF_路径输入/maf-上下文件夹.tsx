import { Button } from "#/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useMafStore } from "../store";

export function MAF_上下文件夹(props: { handPath: (newPath: string) => void }) {
	const store = useMafStore();

	return (
		<ButtonGroup>
			<Button
				onClick={() =>
					props.handPath(store.serverResInfo?.folderNav.prevPath || "")
				}
			>
				{store.serverResInfo?.folderNav.prevStem} 上一个文件夹
			</Button>
			<Button
				onClick={() =>
					props.handPath(store.serverResInfo?.folderNav.currentPath || "")
				}
			>
				{store.serverResInfo?.folderNav.currentStem}
			</Button>
			<Button
				onClick={() =>
					props.handPath(store.serverResInfo?.folderNav.nextPath || "")
				}
			>
				下一个文件夹 {store.serverResInfo?.folderNav.nextStem}
			</Button>
		</ButtonGroup>
	);
}
