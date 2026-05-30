import { useFieldContext } from "#/hooks/create-form-hook";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export function TextField(
	props: {
		label: string;
		col: number;
	} & React.InputHTMLAttributes<HTMLInputElement>,
) {
	const { label, col, ...inputProps } = props;
	const field = useFieldContext<string | number>();

	return (
		<Field className={`col-span-${col}`}>
			<FieldLabel>{props.label}</FieldLabel>
			<Input
				{...inputProps}
				value={
					props?.type === "number"
						? Number(field.state.value)
						: field.state.value
				}
				onChange={(e) => {
					field.handleChange(
						props?.type === "number" ? Number(e.target.value) : e.target.value,
					);
				}}
				onBlur={field.handleBlur}
				className="w-full"
			/>
			{field.state.meta.errors && (
				<FieldDescription>
					{field.state.meta.errors.map((item) => (
						<div className="" key={item}>
							{item}
						</div>
					))}
				</FieldDescription>
			)}
		</Field>
	);
}
