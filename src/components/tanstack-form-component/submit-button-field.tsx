import { Pointer } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext } from "#/hooks/create-form-hook";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "../ui/button";

export function SubmitButtonField(props: { label: string; icon?: ReactNode }) {
	const form = useFormContext();

	return (
		<div className="col-span-12">
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						disabled={isSubmitting}
						type="submit"
						onClick={async () => {
							await form.handleSubmit();
						}}
					>
						{isSubmitting ? (
							<Spinner />
						) : props?.icon ? (
							props.icon
						) : (
							<Pointer />
						)}
						{props.label}
					</Button>
				)}
			</form.Subscribe>
		</div>
	);
}
