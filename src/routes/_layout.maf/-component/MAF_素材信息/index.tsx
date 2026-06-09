import { useAppForm } from "#/components/tanstack-form-component/create-form";
import { useMafStore } from "../store";

export function MAF_素材信息() {
	const store = useMafStore();
	const form = useAppForm({
		defaultValues: store.serverResInfo?.materialFormatWithCount,
	});

	return (
		<form className="item-box">
			<h2 className="col-span-12">素材信息</h2>

			<form.AppField name="count">
				{(field) => <field.TextField label="总数" col={2} />}
			</form.AppField>

			<form.AppField name="countTitle">
				{(field) => <field.TextField label="素材数量" col={2} />}
			</form.AppField>

			<form.AppField name="format">
				{(field) => <field.TextField label="素材格式" col={2} />}
			</form.AppField>

			<form.AppField name="formatTitle">
				{(field) => <field.TextField label="格式标题" col={2} />}
			</form.AppField>

			<form.AppField name="size">
				{(field) => <field.TextField label="素材大小" col={2} />}
			</form.AppField>
		</form>
	);
}
