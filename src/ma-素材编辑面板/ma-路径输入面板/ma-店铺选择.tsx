import { MaSelect } from "#/components/ma-输入框组件/ma-select";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { setting } from "#/setting";

export function MA_店铺选择() {
	const store = useMaterialStore();
	return (
		<MaSelect
			label="店铺"
			options={setting.shopList}
			value={store.shopName}
			onValueChange={(e) => {
				if (e) {
					useMaterialStore.setState((state) => {
						state.shopName = e;
					});
				}
			}}
		/>
	);
}
