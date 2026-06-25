export function insertToLocalStorage(props: { shopName: string; rootPath: string }) {
	if (!props.shopName || props.shopName.trim() === "") return;

	const data = getLocalStorage();
	if (typeof window === "undefined" || !window.localStorage) return;
	if (!data) return;
	const index = data.findIndex((item) => item.shopName === props.shopName);

	if (index > -1) {
		const targetItem = data.splice(index, 1)[0];
		// 过滤掉已存在的相同路径，确保不重复
		targetItem.rootPath = targetItem.rootPath.filter((path) => path !== props.rootPath);
		// 将最新路径插入到最前面
		targetItem.rootPath.unshift(props.rootPath);
		data.unshift(targetItem);

		if (data[0].rootPath.length > 5) {
			data[0].rootPath = data[0].rootPath.slice(0, 5);
		}
	} else {
		data.unshift({
			shopName: props.shopName,
			rootPath: [props.rootPath],
		});
	}
	localStorage.setItem("rootPath", JSON.stringify(data));
}

type localRootPath = { shopName: string; rootPath: string[] }[];

export const getLocalStorage = (): localRootPath => {
	const shopNameSort = [
		{ shopName: "小夕素材", sort: 1 },
		{ shopName: "泡泡素材", sort: 2 },
		{ shopName: "饭桶设计", sort: 3 },
	];
	if (typeof window === "undefined" || !window.localStorage) {
		return [];
	}

	const data = localStorage.getItem("rootPath");
	if (data) {
		const dataJson = JSON.parse(data) as localRootPath;
		return dataJson.sort((a, b) => {
			const sortA = shopNameSort.find((s) => s.shopName === a.shopName)?.sort || 99;
			const sortB = shopNameSort.find((s) => s.shopName === b.shopName)?.sort || 99;
			return sortA - sortB;
		});
	}
	return [];
};
