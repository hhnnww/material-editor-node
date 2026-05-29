import { MA_制作首图信息面板 } from "./ma-首图信息面板";
import { MA_制作首图按钮 } from "./ma-首图制作按钮";

export function MA_制作首图() {
	return (
		<div className="item-box">
			<div className="col-span-12">
				<h2 className="">制作首图</h2>
			</div>

			<MA_制作首图信息面板 />

			<div className="col-span-12">
				<MA_制作首图按钮 />
			</div>
		</div>
	);
}
