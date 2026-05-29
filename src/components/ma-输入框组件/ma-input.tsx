import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface MaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	desc?: string;
}

export function MaInput(props: MaInputProps) {
	const { label, desc: description, ...inputProps } = props;
	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<Input {...inputProps} autoComplete="off" />
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	);
}
