import { MaInput } from "#/components/ma-输入框组件/ma-input";
import { Button } from "#/components/ui/button";
import { useMaterialStore } from "#/lib/use-material-edit-store";

export function MA_发布到淘宝() {
	const store = useMaterialStore();

	return (
		<div className="item-box">
			<div className="col-span-12">
				<h2 className="">发布到淘宝</h2>
			</div>

			<div className="col-span-12">
				<MaInput
					label="发布到淘宝"
					value={store.tbTitle}
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.tbTitle = e.target.value;
						});
					}}
				/>
			</div>

			<div className="col-span-12">
				<Button
					onClick={async () => {
						await navigator.clipboard.writeText(store.tbTitle);
						window.open(
							"https://item.upload.taobao.com/sell/publish.htm?catId=201160807",
							"_blank",
						);
					}}
				>
					复制标题并发布
				</Button>
			</div>
		</div>
	);
}
