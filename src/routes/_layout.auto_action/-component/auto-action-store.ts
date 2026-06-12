import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type useAutoAction = {
	shopName: string;
	dstPath: string;
	firstNum: number;
};

export const useAutoAction = create<useAutoAction>()(
	immer(() => ({
		shopName: "",
		dstPath: "",
		firstNum: 0,
	})),
);
