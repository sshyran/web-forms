import { JAVAROSA_NAMESPACE_URI } from '@odk/common/constants/xmlns.ts';
import type { RepeatDefinition } from '../body/repeat/RepeatDefinition.ts';
import { BindDefinition } from './BindDefinition.ts';
import { DescendentNodeDefinition } from './DescendentNodeDefinition.ts';
import type { ChildNodeDefinition, NodeDefinition } from './NodeDefinition.ts';
import type { RepeatSequenceDefinition } from './RepeatSequenceDefinition.ts';

const repeatTemplates = new WeakMap<BindDefinition, RepeatTemplateDefinition>();

interface ExplicitRepeatTemplateElement extends Element {
	getAttributeNS(namespaceURI: typeof JAVAROSA_NAMESPACE_URI, name: 'template'): string;
	getAttributeNS(namespaceURI: string | null, name: string): string | null;

	hasAttributeNS(namespaceURI: typeof JAVAROSA_NAMESPACE_URI, name: 'template'): true;
	(namespaceURI: string | null, name: string): boolean;
}

const isExplicitRepeatTemplateElement = (
	element: Element
): element is ExplicitRepeatTemplateElement => {
	return element.hasAttributeNS(JAVAROSA_NAMESPACE_URI, 'template');
};

type InstanceNodes = readonly [template: ExplicitRepeatTemplateElement, ...rest: Element[]];

interface LeafNode extends Element {
	readonly childElementCount: 0;
}

const isLeafNode = (element: Element): element is LeafNode => {
	return element.childElementCount === 0;
};

const clearLeafNodes = <T extends Element>(element: T): T => {
	if (isLeafNode(element)) {
		element.textContent = '';
	} else {
		for (const child of element.children) {
			clearLeafNodes(child);
		}
	}

	return element;
};

const getOrCreateTemplateElement = (element: Element): ExplicitRepeatTemplateElement => {
	if (isExplicitRepeatTemplateElement(element)) {
		return element;
	}

	const clone = element.cloneNode(true) as Element;
	clone.setAttributeNS(JAVAROSA_NAMESPACE_URI, 'template', '');

	return clearLeafNodes(clone as ExplicitRepeatTemplateElement);
};

// TODO: under what circumstances should a default instance be created, and is
// this the appropriate place for that?
const splitInstanceNodes = (modelNodes: readonly [Element, ...Element[]]): InstanceNodes => {
	const [first, ...rest] = modelNodes;
	const template = getOrCreateTemplateElement(first);

	if (template === first) {
		return [template, ...rest];
	}

	return [template, ...modelNodes];
};

interface ParsedRepeatNodes {
	readonly template: RepeatTemplateDefinition;
	readonly instanceNodes: readonly Element[];
}

export class RepeatTemplateDefinition
	extends DescendentNodeDefinition<'repeat-template', RepeatDefinition>
	implements NodeDefinition<'repeat-template'>
{
	static parseModelNodes(
		sequence: RepeatSequenceDefinition,
		modelNodes: readonly [Element, ...Element[]]
	): ParsedRepeatNodes {
		const { bind } = sequence;

		let template = repeatTemplates.get(bind);
		let instanceNodes: readonly Element[];

		if (template == null) {
			const [templateNode, ...rest] = splitInstanceNodes(modelNodes);

			instanceNodes = rest;
			template = new this(sequence, templateNode);
		} else {
			// TODO: this is under the assumption that for any depth > 1, if a
			// template has already been defined for the given form definition, any
			// subsequent nodes matching the repeat's nodeset are implicitly default
			// instances. Is this right?
			const duplicateTemplate = modelNodes.find((node) =>
				node.hasAttributeNS(JAVAROSA_NAMESPACE_URI, 'template')
			);

			if (duplicateTemplate != null) {
				throw new Error(`Multiple explicit templates defined for ${bind.nodeset}`);
			}

			instanceNodes = modelNodes;
		}

		return {
			template,
			instanceNodes,
		};
	}

	readonly type = 'repeat-template';

	readonly node: Element;
	readonly nodeName: string;
	readonly children: readonly ChildNodeDefinition[];
	readonly instances = null;
	readonly defaultValue = null;

	protected constructor(
		protected readonly sequence: RepeatSequenceDefinition,
		protected readonly templateNode: ExplicitRepeatTemplateElement
	) {
		const {
			bind,
			bodyElement: repeatGroupBodyElement,
			parent: repeatSequenceParent,
			root,
		} = sequence;

		super(repeatSequenceParent, bind, repeatGroupBodyElement.repeat);

		const node = templateNode.cloneNode(true) as Element;

		node.removeAttributeNS(JAVAROSA_NAMESPACE_URI, 'template');

		this.node = node;
		this.nodeName = node.localName;
		this.children = root.buildSubtree(this);
	}

	toJSON() {
		const { bind, bodyElement, parent, root, sequence, ...rest } = this;

		return rest;
	}
}
