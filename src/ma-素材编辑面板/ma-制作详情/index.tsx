import { MA_详情信息面板 } from "./ma-详情信息面板";
import { MA_制作详情按钮 } from "./ma-详情制作按钮";

export function MA_制作详情() {
	return (
		<div className="item-box">
			<div className="col-span-12">
				<h2 className="">制作详情</h2>
			</div>
			<MA_详情信息面板 />
			<div className="col-span-12">
				<MA_制作详情按钮 />
			</div>
		</div>
	);
}
