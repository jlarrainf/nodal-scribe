"use client";

type ConsentCheckboxProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
};

export function ConsentCheckbox({
	checked,
	onChange,
	disabled,
}: ConsentCheckboxProps) {
	return (
		<label className="flex items-start gap-3 rounded-3xl border border-black/10 bg-white/70 p-4 text-sm text-ink shadow-sm backdrop-blur">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
				className="mt-1 h-4 w-4 rounded border-black/30 text-forest focus:ring-forest"
			/>
			<span>
				Confirmo que el paciente otorgó consentimiento verbal para la grabación
				y el procesamiento de la consulta.
			</span>
		</label>
	);
}
