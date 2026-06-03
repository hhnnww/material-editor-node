import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { orpc } from "#/orpc/client";
import { useMafStore } from "../store";
import { maf_详情表单参数 } from "./maf-详情-表单参数";

export function MAF_制作详情() {
	const mutation = useMutation(
		orpc.ORPC_制作详情.mutationOptions({
			onSuccess: () => {
				toast.info("制作详情成功", {
					position: "top-center",
					icon: <CircleCheck />,
				});
			},
		}),
	);
	const makdDate = useMutation(orpc.ORPC_制作数据图.mutationOptions());

	const store = useMafStore();
	const form = useAppForm({
		...maf_详情表单参数,
		onSubmit: async (ctx) => {
			if (
				!store.serverResInfo?.effectImageList ||
				!store.serverResInfo.previewImageList
			) {
				alert("必须先加载图片");
				return;
			}
			await makdDate.mutateAsync(
				[
					{
						name: "商家编码",
						content: store.serverResInfo.folderNav.currentStem,
					},
					{
						name: "素材格式",
						content: store.serverResInfo.materialFormatWithCount.formatTitle,
					},
					{
						name: "素材数量",
						content: store.serverResInfo.materialFormatWithCount.countTitle,
					},
					{
						name: "素材大小",
						content: store.serverResInfo.materialFormatWithCount.size,
					},
					{
						name: "发货方式",
						content: "本店仅支持百度网盘实时发货，不支持其他任何方式",
					},
				].concat(
					store.shopName === "泡泡素材"
						? [
								{
									name: "PSD文件",
									content: "本店PSD文件不分层，购买前请知晓。",
								},
							]
						: [],
				),
			);
			await mutation.mutateAsync({
				...ctx.value,
				effectImageList: store.serverResInfo?.effectImageList,
				previewImageList: store.serverResInfo.previewImageList,
			});
		},
	});

	return (
		<form
			className="item-box"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<h2 className="col-span-12">制作详情</h2>
			<form.AppField name="rows">
				{(field) => (
					<field.TextField
						label="栏数"
						col={2}
						type="number"
						min={1}
						max={5}
						step={1}
					/>
				)}
			</form.AppField>

			<form.AppField name="制作效果图">
				{(field) => (
					<field.SelectField
						label="制作效果图"
						options={["制作", "不制作"]}
						col={2}
					/>
				)}
			</form.AppField>

			<form.AppField name="制作预览图">
				{(field) => (
					<field.SelectField
						label="制作预览图"
						options={["制作", "不制作"]}
						col={2}
					/>
				)}
			</form.AppField>

			<form.AppField name="borderRadius">
				{(field) => (
					<field.TextField
						label="小图圆角"
						col={2}
						type="number"
						min={0}
						max={50}
						step={5}
					/>
				)}
			</form.AppField>

			<form.AppField name="innerSpacing">
				{(field) => (
					<field.TextField
						label="内边距"
						type="number"
						col={2}
						min={0}
						max={100}
						step={5}
					/>
				)}
			</form.AppField>

			<form.AppField name="outerSpacing">
				{(field) => (
					<field.TextField
						label="外边距"
						type="number"
						col={2}
						min={0}
						max={100}
						step={5}
					/>
				)}
			</form.AppField>

			<form.AppForm>
				<form.SubmitButtonField label="制作详情" />
			</form.AppForm>
		</form>
	);
}
