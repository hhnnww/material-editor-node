import { useMaterialStore } from "#/lib/use-material-edit-store";
import { MA_上下文件夹 } from "./ma-上下文件夹";
import { MA_加载按钮 } from "./ma-加载按钮";
import { MA_店铺选择 } from "./ma-店铺选择";
import { MA_路径输入 } from "./ma-路径输入";

export function MA_路径和店铺输入框() {
	const store = useMaterialStore();
	return (
		<div className="item-box">
			<div className="col-span-12">
				<h2 className="">素材输入</h2>
			</div>
			<div className="col-span-2">
				<MA_店铺选择 />
			</div>

			<div className="col-span-10">
				<MA_路径输入 />
			</div>

			<div className="col-span-12">
				<div className="flex flex-row items-center gap-2">
					<MA_加载按钮 />
					{store.serverResInfo && <MA_上下文件夹 />}
				</div>
			</div>
		</div>
	);
}
