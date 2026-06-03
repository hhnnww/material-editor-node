import { useEffect } from "react";
import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { useMafStore } from "./store";

export function MAF_发布到淘宝() {
	const store = useMafStore();
	const form = useAppForm({
		defaultValues: { title: "" },
		onSubmit: async (ctx) => {
			const title = ctx.value.title;
			await navigator.clipboard.writeText(
				`${title}${store.serverResInfo?.folderNav.currentStem || ""}`,
			);
			window.open(
				"https://item.upload.taobao.com/sell/publish.htm?catId=201160807",
				"_blank",
			);
		},
	});
	useEffect(() => {
		if (store.serverResInfo) {
			form.setFieldValue("title", "");
		}
	}, [form.setFieldValue, store.serverResInfo]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="item-box"
		>
			<form.AppField name="title">
				{(field) => <field.TextField col={10} label="发布到淘宝" />}
			</form.AppField>
			<form.AppForm>
				<form.SubmitButtonField label="发布到淘宝" />
			</form.AppForm>
		</form>
	);
}
