import type {
	AnyBodyElementDefinition,
	BodyDefinition,
	NonRepeatGroupElementDefinition,
} from '../body/BodyDefinition.ts';
import type { BindDefinition } from './BindDefinition.ts';
import { DescendentNodeDefinition } from './DescendentNodeDefinition.ts';
import type {
	ChildNodeDefinition,
	NodeDefinition,
	ParentNodeDefinition,
} from './NodeDefinition.ts';

export class SubtreeDefinition
	extends DescendentNodeDefinition<'subtree', NonRepeatGroupElementDefinition | null>
	implements NodeDefinition<'subtree'>
{
	readonly type = 'subtree';

	readonly nodeName: string;
	readonly children: readonly ChildNodeDefinition[];
	readonly instances = null;
	readonly defaultValue = null;

	constructor(
		parent: ParentNodeDefinition,
		body: BodyDefinition,
		bind: BindDefinition,
		bodyElement: AnyBodyElementDefinition | null,
		readonly node: Element
	) {
		if (
			bodyElement != null &&
			(bodyElement.category !== 'structure' || bodyElement.type === 'repeat-group')
		) {
			throw new Error(`Unexpected body element for nodeset ${bind.nodeset}`);
		}

		super(parent, bind, bodyElement);

		const { root } = parent;

		this.nodeName = node.localName;
		this.children = root.buildSubtree(this, body);
	}

	toJSON() {
		const { parent, bind, root, ...rest } = this;

		return rest;
	}
}
