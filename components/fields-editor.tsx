"use client";

import {
	generateFieldKey,
	type FieldKind,
	type SpecialtyField,
} from "@/lib/ai/specialties";

type FieldsEditorProps = {
	fields: SpecialtyField[];
	onChange: (fields: SpecialtyField[]) => void;
};

const KIND_LABEL: Record<FieldKind, string> = {
	text: "texto",
	list: "lista",
	group: "grupo",
};

const KIND_BADGE: Record<FieldKind, string> = {
	text: "bg-clay/10 text-clay",
	list: "bg-forest/10 text-forest",
	group: "bg-ink/10 text-ink/60",
};

const MAX_GROUP_DEPTH = 2;

function updateAt(
	fields: ReadonlyArray<SpecialtyField>,
	path: number[],
	updater: (field: SpecialtyField) => SpecialtyField,
): SpecialtyField[] {
	const [head, ...rest] = path;
	return fields.map((field, i) => {
		if (i !== head) {
			return field;
		}
		if (rest.length === 0) {
			return updater(field);
		}
		return { ...field, children: updateAt(field.children ?? [], rest, updater) };
	});
}

function removeAt(
	fields: ReadonlyArray<SpecialtyField>,
	path: number[],
): SpecialtyField[] {
	const [head, ...rest] = path;
	if (rest.length === 0) {
		return fields.filter((_, i) => i !== head);
	}
	return fields.map((field, i) => {
		if (i !== head) {
			return field;
		}
		return { ...field, children: removeAt(field.children ?? [], rest) };
	});
}

function insertAt(
	fields: ReadonlyArray<SpecialtyField>,
	parentPath: number[],
	field: SpecialtyField,
): SpecialtyField[] {
	if (parentPath.length === 0) {
		return [...fields, field];
	}
	const [head, ...rest] = parentPath;
	return fields.map((item, i) => {
		if (i !== head) {
			return item;
		}
		return { ...item, children: insertAt(item.children ?? [], rest, field) };
	});
}

function childrenAtPath(
	fields: ReadonlyArray<SpecialtyField>,
	path: number[],
): ReadonlyArray<SpecialtyField> {
	let nodes: ReadonlyArray<SpecialtyField> = fields;
	for (const idx of path) {
		nodes = nodes[idx]?.children ?? [];
	}
	return nodes;
}

function moveAt(
	fields: ReadonlyArray<SpecialtyField>,
	path: number[],
	dir: -1 | 1,
): SpecialtyField[] {
	const parentPath = path.slice(0, -1);
	const index = path[path.length - 1];
	const siblings = childrenAtPath(fields, parentPath);
	const target = index + dir;
	if (target < 0 || target >= siblings.length) {
		return [...fields];
	}
	const reordered = [...siblings];
	[reordered[index], reordered[target]] = [reordered[target], reordered[index]];
	if (parentPath.length === 0) {
		return reordered;
	}
	return updateAt(fields, parentPath, (field) => ({
		...field,
		children: reordered,
	}));
}

function newField(kind: FieldKind): SpecialtyField {
	const field: SpecialtyField = {
		key: generateFieldKey(),
		label:
			kind === "group" ? "Nuevo grupo"
			: kind === "list" ? "Nueva lista"
			: "Nuevo campo",
		kind,
	};
	if (kind === "group") {
		field.children = [];
	}
	return field;
}

function IconButton({
	onClick,
	label,
	danger,
	children,
}: {
	onClick: () => void;
	label: string;
	danger?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className={`flex h-6 w-6 items-center justify-center rounded-md transition ${
				danger ?
					"text-ink/40 hover:bg-red-50 hover:text-red-600"
				:	"text-ink/40 hover:bg-forest/10 hover:text-forest"
			}`}
		>
			{children}
		</button>
	);
}

function AddButton({
	onClick,
	children,
}: {
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="rounded-full border border-dashed border-black/15 bg-white/50 px-2.5 py-1 text-[11px] font-medium text-ink/60 transition hover:border-forest/40 hover:text-forest"
		>
			{children}
		</button>
	);
}

type FieldRowProps = {
	field: SpecialtyField;
	path: number[];
	depth: number;
	onRename: (path: number[], label: string) => void;
	onRemove: (path: number[]) => void;
	onMove: (path: number[], dir: -1 | 1) => void;
	onAddChild: (parentPath: number[], kind: FieldKind) => void;
};

function FieldRow({
	field,
	path,
	depth,
	onRename,
	onRemove,
	onMove,
	onAddChild,
}: FieldRowProps) {
	const isGroup = field.kind === "group";

	return (
		<div className={depth > 0 ? "border-l border-black/8 pl-2.5" : ""}>
			<div className="flex items-center gap-1.5 rounded-lg border border-black/8 bg-white/70 px-2 py-1.5">
				<span
					className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${KIND_BADGE[field.kind]}`}
				>
					{KIND_LABEL[field.kind]}
				</span>
				<input
					value={field.label}
					onChange={(event) => onRename(path, event.target.value)}
					placeholder="Etiqueta del campo"
					className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none placeholder:text-ink/30"
				/>
				<div className="flex shrink-0 items-center gap-0.5">
					<IconButton onClick={() => onMove(path, -1)} label="Subir">
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
						</svg>
					</IconButton>
					<IconButton onClick={() => onMove(path, 1)} label="Bajar">
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					</IconButton>
					<IconButton onClick={() => onRemove(path)} label="Eliminar" danger>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</IconButton>
				</div>
			</div>

			{isGroup ?
				<div className="mt-1.5 grid gap-1.5 pl-2">
					{(field.children ?? []).map((child, i) => (
						<FieldRow
							key={child.key}
							field={child}
							path={[...path, i]}
							depth={depth + 1}
							onRename={onRename}
							onRemove={onRemove}
							onMove={onMove}
							onAddChild={onAddChild}
						/>
					))}
					<div className="flex flex-wrap gap-1">
						<AddButton onClick={() => onAddChild(path, "text")}>+ Texto</AddButton>
						<AddButton onClick={() => onAddChild(path, "list")}>+ Lista</AddButton>
						{depth < MAX_GROUP_DEPTH && (
							<AddButton onClick={() => onAddChild(path, "group")}>+ Grupo</AddButton>
						)}
					</div>
				</div>
			:	null}
		</div>
	);
}

export function FieldsEditor({ fields, onChange }: FieldsEditorProps) {
	const rename = (path: number[], label: string) =>
		onChange(updateAt(fields, path, (field) => ({ ...field, label })));
	const remove = (path: number[]) => onChange(removeAt(fields, path));
	const move = (path: number[], dir: -1 | 1) =>
		onChange(moveAt(fields, path, dir));
	const addChild = (parentPath: number[], kind: FieldKind) =>
		onChange(insertAt(fields, parentPath, newField(kind)));
	const addTop = (kind: FieldKind) => onChange(insertAt(fields, [], newField(kind)));

	return (
		<div className="grid gap-2">
			{fields.length === 0 && (
				<p className="rounded-lg border border-dashed border-black/12 px-3 py-4 text-center text-xs text-ink/45">
					Sin campos todavía. Añade texto, listas o grupos.
				</p>
			)}
			{fields.map((field, i) => (
				<FieldRow
					key={field.key}
					field={field}
					path={[i]}
					depth={0}
					onRename={rename}
					onRemove={remove}
					onMove={move}
					onAddChild={addChild}
				/>
			))}
			<div className="mt-1 flex flex-wrap gap-1.5">
				<AddButton onClick={() => addTop("text")}>+ Texto</AddButton>
				<AddButton onClick={() => addTop("list")}>+ Lista</AddButton>
				<AddButton onClick={() => addTop("group")}>+ Grupo</AddButton>
			</div>
		</div>
	);
}
