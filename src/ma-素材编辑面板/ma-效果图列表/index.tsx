import { useMaterialStore } from "#/lib/use-material-edit-store";
import { MA_效果图全选和全不选 } from "./ma-效果图全选和全不选";

export function MA_效果图列表() {
	const store = useMaterialStore();

	return (
		<div className="item-box">
			<div className="col-span-12">
				<h2 className="">效果图列表</h2>
			</div>

			<div className="col-span-12">
				<MA_效果图全选和全不选 />
			</div>

			{store.serverResInfo.effectImageList.map((item) => {
				const isSelected = store.stOptions.imageList.some(
					(img) => img.imagePath === item.imagePath,
				);
				return (
					<button
						type="button"
						className="col-span-2"
						key={item.imagePath}
						onClick={() => {
							useMaterialStore.setState((state) => {
								if (!isSelected) {
									state.stOptions.imageList = [
										...state.stOptions.imageList,
										{
											imagePath: item.imagePath,
											width: item.width,
											height: item.height,
											imageRatio: item.imageRatio,
										},
									];
								} else {
									state.stOptions.imageList = state.stOptions.imageList.filter(
										(img) => img.imagePath !== item.imagePath,
									);
								}
							});
						}}
					>
						<div className="flex flex-col gap-2 items-start">
							<img
								src={`/__local_disk_stream__/${item.thumbpath}`}
								alt={item.imagePath}
								className={`p-2 ${isSelected ? "bg-blue-600" : "bg-transparent"}`}
							/>
							<div className="">{item.imageRatio}</div>
						</div>
					</button>
				);
			})}
		</div>
	);
}
