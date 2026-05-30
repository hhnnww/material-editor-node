import { useFieldContext } from "#/hooks/create-form-hook";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "../ui/field";

export function SelectField(props: {
	label: string;
	col: number;
	options: string[];
}) {
	const field = useFieldContext<string>();
	return (
		<Field className={`col-span-${props.col}`}>
			<FieldLabel>{props.label}</FieldLabel>
			<Select
				value={field.state.value}
				onValueChange={(e) => {
					if (e) {
						field.handleChange(e);
					}
				}}
			>
				<SelectTrigger className="w-full ">
					<SelectValue placeholder={props.label} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{props.options.map((item) => (
							<SelectItem value={item} key={item}>
								{item}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	);
}
