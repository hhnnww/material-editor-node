import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "../ui/field";

export function MaSelect(props: {
	label: string;
	options: string[];
	value: string;
	onValueChange: (value: string | null) => void;
}) {
	const { label, options, ...selectProps } = props;

	return (
		<Field>
			<FieldLabel>{label}</FieldLabel>
			<Select {...selectProps}>
				<SelectTrigger>
					<SelectValue placeholder={label} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options.map((item) => (
							<SelectItem key={item} value={item}>
								{item}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}
