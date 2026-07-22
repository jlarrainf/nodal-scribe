import type { ReactNode } from "react";

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let index = 0;

	INLINE_PATTERN.lastIndex = 0;
	while ((match = INLINE_PATTERN.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		const token = match[0];
		const key = `${keyPrefix}-${index}`;
		if (token.startsWith("**")) {
			nodes.push(
				<strong key={key} className="font-semibold text-ink">
					{token.slice(2, -2)}
				</strong>,
			);
		} else if (token.startsWith("`")) {
			nodes.push(
				<code
					key={key}
					className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[0.85em] text-forest"
				>
					{token.slice(1, -1)}
				</code>,
			);
		} else {
			nodes.push(
				<em key={key} className="italic">
					{token.slice(1, -1)}
				</em>,
			);
		}

		lastIndex = INLINE_PATTERN.lastIndex;
		index += 1;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

type ListBuffer = {
	ordered: boolean;
	items: string[];
};

export function MarkdownNote({ content }: { content: string }) {
	const lines = content.split("\n");
	const blocks: ReactNode[] = [];
	let listBuffer: ListBuffer | null = null;
	let blockIndex = 0;

	const flushList = () => {
		if (!listBuffer) {
			return;
		}
		const buffer = listBuffer;
		const listKey = `list-${blockIndex}`;
		blockIndex += 1;

		if (buffer.ordered) {
			blocks.push(
				<ol
					key={listKey}
					className="my-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-ink/80 marker:text-ink/40"
				>
					{buffer.items.map((item, i) => (
						<li key={i}>{renderInline(item, `${listKey}-${i}`)}</li>
					))}
				</ol>,
			);
		} else {
			blocks.push(
				<ul
					key={listKey}
					className="my-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink/80 marker:text-forest/60"
				>
					{buffer.items.map((item, i) => (
						<li key={i}>{renderInline(item, `${listKey}-${i}`)}</li>
					))}
				</ul>,
			);
		}
		listBuffer = null;
	};

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();

		if (!line.trim()) {
			flushList();
			continue;
		}

		const heading = /^(#{1,4})\s+(.*)$/.exec(line);
		if (heading) {
			flushList();
			const level = heading[1].length;
			const text = heading[2];
			const key = `h-${blockIndex}`;
			blockIndex += 1;
			blocks.push(
				level <= 2 ?
					<h3
						key={key}
						className="mt-3 mb-1 text-sm font-semibold uppercase tracking-[0.08em] text-forest first:mt-0"
					>
						{renderInline(text, key)}
					</h3>
				:	<h4 key={key} className="mt-2 mb-0.5 text-sm font-semibold text-ink first:mt-0">
						{renderInline(text, key)}
					</h4>,
			);
			continue;
		}

		const unordered = /^[-*]\s+(.*)$/.exec(line);
		if (unordered) {
			if (!listBuffer || listBuffer.ordered) {
				flushList();
				listBuffer = { ordered: false, items: [] };
			}
			listBuffer.items.push(unordered[1]);
			continue;
		}

		const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
		if (ordered) {
			if (!listBuffer || !listBuffer.ordered) {
				flushList();
				listBuffer = { ordered: true, items: [] };
			}
			listBuffer.items.push(ordered[1]);
			continue;
		}

		flushList();
		const key = `p-${blockIndex}`;
		blockIndex += 1;
		blocks.push(
			<p key={key} className="my-1.5 text-sm leading-6 text-ink/80">
				{renderInline(line, key)}
			</p>,
		);
	}

	flushList();

	return <div className="space-y-0.5">{blocks}</div>;
}
