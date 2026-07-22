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
		<label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-black/8 bg-paper/30 px-3.5 py-3 transition hover:border-forest/30">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
				className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/30 accent-forest focus:ring-forest"
			/>
			<span className="text-[13px] leading-5 text-ink/80">
				Confirmo que el paciente otorgó consentimiento verbal para la grabación
				y el procesamiento de la consulta.
			</span>
		</label>
	);
}
