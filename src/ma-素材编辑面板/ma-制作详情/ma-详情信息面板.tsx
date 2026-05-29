import { MaInput } from "#/components/ma-输入框组件/ma-input";
import { MaSelect } from "#/components/ma-输入框组件/ma-select";
import { useMaterialStore } from "#/lib/use-material-edit-store";

export function MA_详情信息面板() {
	const store = useMaterialStore();

	return (
		<>
			<div className="col-span-2">
				<MaInput
					label="栏数"
					value={store.xqOptions.rows}
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.xqOptions.rows = Number(e.target.value);
						});
					}}
					type={"number"}
					min={1}
					max={3}
					step={1}
				/>
			</div>

			<div className="col-span-2">
				<MaSelect
					label="制作效果图"
					value={store.xqOptions.制作效果图}
					onValueChange={(e) => {
						useMaterialStore.setState((state) => {
							state.xqOptions.制作效果图 = e as string;
						});
					}}
					options={["制作", "不制作"]}
				/>
			</div>

			<div className="col-span-2">
				<MaSelect
					label="制作预览图"
					value={store.xqOptions.制作预览图}
					onValueChange={(e) => {
						useMaterialStore.setState((state) => {
							state.xqOptions.制作预览图 = e as string;
						});
					}}
					options={["制作", "不制作"]}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="内边距"
					value={store.xqOptions.innerSpacing}
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.xqOptions.innerSpacing = Number(e.target.value);
						});
					}}
					type={"number"}
					min={0}
					max={50}
					step={5}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="外边距"
					value={store.xqOptions.outerSpacing}
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.xqOptions.outerSpacing = Number(e.target.value);
						});
					}}
					type={"number"}
					min={0}
					max={50}
					step={5}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="图片圆角"
					value={store.xqOptions.borderRadius}
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.xqOptions.borderRadius = Number(e.target.value);
						});
					}}
					type="number"
					min={0}
					max={50}
					step={5}
				/>
			</div>
		</>
	);
}
