import type { ValueNodeDefinition } from '../../xform/model/ValueNodeDefinition.ts';
import type { BaseNode, BaseNodeState } from './BaseNode.ts';
import type { RootNode } from './RootNode.ts';
import type { TextRange } from './TextRange.ts';
import type { GeneralParentNode } from './hierarchy.ts';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- referenced in JSDoc
import type { StringNode } from './StringNode.ts';

interface SelectItem {
	get value(): string;
	get label(): TextRange<'label'> | null;
}

export interface SelectNodeState extends BaseNodeState {
	get children(): null;

	/**
	 * This value is treated as set-like by the engine, where each
	 * {@link SelectItem.value | item's `value`} may occur once (at most), and:
	 *
	 * - Fields defined with an XForms `<select>` may contain multiple items
	 * - Fields defined with an XForms `<select1>` will always produce one item
	 *   (at most)
	 *
	 * @todo Maybe it makes more sense for the client interface to break these up!
	 * Should a `SelectNodeState` have this `value` type, whereas a hypothetical
	 * `Select1NodeState` would have `get value(): SelectItem | null`?
	 */
	get value(): readonly SelectItem[];
}

export interface SelectNode extends BaseNode {
	readonly definition: ValueNodeDefinition;
	readonly root: RootNode;
	readonly parent: GeneralParentNode;

	/**
	 * For use by a client to update the selection of a select node where:
	 *
	 * - For fields defined with an XForms `<select>`, calling this method is
	 *   additive, i.e. it will include the item in its
	 *   {@link SelectNodeState.value}.
	 * - For fields defined with an XForms `<select1>`, calling this method will
	 *   replace the selection (if any).
	 *
	 * @todo @see {@link StringNode.setValue} re: write restrictions
	 * @todo @see {@link SelectNodeState.value} re: breaking up the types
	 */
	select(item: SelectItem): RootNode;

	/**
	 * For use by a client to remove an item from the node's
	 * {@link SelectNodeState.value}.
	 *
	 * @todo @see {@link StringNode.setValue} re: write restrictions
	 */
	deselect(item: SelectItem): RootNode;
}
