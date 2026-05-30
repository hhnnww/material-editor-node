import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "#/hooks/create-form-hook";
import { SelectField } from "./select-field";
import { SubmitButtonField } from "./submit-button-field";
import { TextField } from "./text-field";

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		TextField,
		SelectField,
	},
	formComponents: {
		SubmitButtonField,
	},
	fieldContext,
	formContext,
});
