import { MaInput } from "#/components/ma-输入框组件/ma-input";
import { MaSelect } from "#/components/ma-输入框组件/ma-select";
import { useMaterialStore } from "#/lib/use-material-edit-store";
import { setting } from "#/setting";

export function MA_制作首图信息面板() {
	const store = useMaterialStore();

	return (
		<>
			<div className="col-span-2">
				<MaInput
					value={store.stOptions.title}
					label="首图标题"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.title = e.target.value;
						});
					}}
				/>
			</div>

			<div className="col-span-2">
				<MaSelect
					value={store.stOptions.style}
					label="首图样式"
					options={setting.stStyleList}
					onValueChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.style = e as string;
						});
					}}
				/>
			</div>

			<div className="col-span-2">
				<MaSelect
					value={store.stOptions.layout}
					onValueChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.layout = e as string;
						});
					}}
					options={setting.stLayoutList}
					label="裁剪方式"
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="栏数"
					value={store.stOptions.rows}
					type="number"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.rows = Number(e.target.value);
						});
					}}
					min={1}
					max={6}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="内距离"
					value={store.stOptions.innerSpacing}
					type="number"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.innerSpacing = Number(e.target.value);
						});
					}}
					min={0}
					max={200}
					step={5}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="外距离"
					value={store.stOptions.outerSpacing}
					type="number"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.outerSpacing = Number(e.target.value);
						});
					}}
					min={0}
					max={200}
					step={5}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="图片圆角"
					value={store.stOptions.borderRadius}
					type="number"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.borderRadius = Number(e.target.value);
						});
					}}
					min={0}
					max={100}
					step={5}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					value={store.stOptions.format}
					label="素材格式"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.format = e.target.value;
						});
					}}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					value={store.stOptions.background}
					label="背景颜色"
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.background = e.target.value;
						});
					}}
				/>
			</div>

			<div className="col-span-2">
				<MaInput
					label="首图名称"
					value={store.stOptions.nameNum}
					onChange={(e) => {
						useMaterialStore.setState((state) => {
							state.stOptions.nameNum = Number(e.target.value);
						});
					}}
					type="number"
					min={1}
					max={5}
					step={1}
				/>
			</div>
		</>
	);
}
