import { MaInput } from "#/components/ma-输入框组件/ma-input";
import { useMaterialStore } from "#/lib/use-material-edit-store";

export function MA_路径输入() {
	const store = useMaterialStore();

	return (
		<MaInput
			label="路径"
			value={store.rootPath}
			onChange={(e) => {
				useMaterialStore.setState((state) => {
					state.rootPath = e.target.value;
				});
			}}
		/>
	);
}
