import { withForm } from "#/components/tanstack-form-component/create-form";
import { setting } from "#/setting";
import { maf_制作首图_表单参数 } from "./maf-制作首图-表单参数";

export const MAF_制作首图_子表单_首图信息 = withForm({
	...maf_制作首图_表单参数,
	render: function Render({ form }) {
		return (
			<div className="item-box">
				<h2 className="col-span-12">制作首图</h2>

				<form.AppField name="title">
					{(field) => <field.TextField label="标题" col={2} />}
				</form.AppField>

				<form.AppField name="style">
					{(field) => (
						<field.SelectField
							label="样式"
							col={2}
							options={setting.stStyleList}
						/>
					)}
				</form.AppField>

				<form.AppField name="layout">
					{(field) => (
						<field.SelectField
							label="布局"
							options={setting.stLayoutList}
							col={2}
						/>
					)}
				</form.AppField>

				<form.AppField name="rows">
					{(field) => (
						<field.TextField
							label="栏数"
							col={2}
							type="number"
							min={1}
							max={20}
							step={1}
						/>
					)}
				</form.AppField>

				<form.AppField name="format">
					{(field) => <field.TextField label="格式" col={2} />}
				</form.AppField>

				<form.AppField name="background">
					{(field) => <field.TextField label="背景颜色" col={2} />}
				</form.AppField>

				<form.AppField name="borderRadius">
					{(field) => (
						<field.TextField
							label="小图圆角"
							col={2}
							type="number"
							min={0}
							max={100}
							step={5}
						/>
					)}
				</form.AppField>

				<form.AppField name="innerSpacing">
					{(field) => (
						<field.TextField
							label="内边距"
							col={2}
							type="number"
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
							col={2}
							type="number"
							min={0}
							max={100}
							step={5}
						/>
					)}
				</form.AppField>

				<form.AppField name="currentStem">
					{(field) => <field.TextField label="当前货号" col={2} />}
				</form.AppField>

				<form.AppField name="nameNum">
					{(field) => (
						<field.TextField
							label="保存名称"
							col={2}
							type="number"
							min={1}
							max={10}
							step={1}
						/>
					)}
				</form.AppField>

				<form.AppField name="shopName">
					{(field) => <field.TextField label="当前店铺" col={2} />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButtonField label="制作首图" />
				</form.AppForm>
			</div>
		);
	},
});
