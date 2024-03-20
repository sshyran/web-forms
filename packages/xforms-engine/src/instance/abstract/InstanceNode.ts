import type { XFormsXPathEvaluator } from '@odk-web-forms/xpath';
import type { BaseNode, BaseNodeState } from '../../client/BaseNode.ts';
import type {
	ClientState,
	EngineClientState,
	EngineState,
} from '../../lib/reactivity/engine-client-state.ts';
import type { ReactiveScope } from '../../lib/reactivity/scope.ts';
import type { AnyNodeDefinition } from '../../model/NodeDefinition.ts';
import type { RepeatSequenceDefinition } from '../../model/RepeatSequenceDefinition.ts';
import type { Root } from '../Root.ts';
import type { AnyChildNode, AnyParentNode } from '../hierarchy.ts';
import type { EvaluationContext } from '../internal-api/EvaluationContext.ts';
import type { InstanceConfig } from '../internal-api/InstanceConfig.ts';
import type { SubscribableDependency } from '../internal-api/SubscribableDependency.ts';

export interface InstanceNodeState extends BaseNodeState {
	get children(): readonly AnyChildNode[] | null;
}

type EvaluationContextNode<Definition extends AnyNodeDefinition> =
	Definition extends RepeatSequenceDefinition ? Node : Element;

export abstract class InstanceNode<
		Definition extends AnyNodeDefinition,
		State extends InstanceNodeState,
	>
	implements BaseNode, EvaluationContext, SubscribableDependency
{
	/**
	 * Note: {@link currentState} is expected to reference this property's
	 * {@link EngineClientState.clientState | `clientState`} sub-property.
	 */
	protected abstract readonly state: EngineClientState<State>;

	/**
	 * Convenience access to the same property in {@link state}.
	 */
	protected abstract readonly engineState: EngineState<State>;

	// BaseNode: identity
	readonly nodeId: string;

	// BaseNode: node-specific
	readonly definition: Definition;

	abstract readonly currentState: ClientState<State>;

	// BaseNode: instance-global/shared
	readonly engineConfig: InstanceConfig;

	// BaseNode: structural
	abstract readonly root: Root;
	abstract readonly parent: AnyParentNode | null;

	// EvaluationContext: instance-global/shared
	abstract readonly evaluator: XFormsXPathEvaluator;

	// EvaluationContext *and* Subscribable: node-specific
	abstract readonly scope: ReactiveScope;

	// EvaluationContext: node-specific
	abstract get contextReference(): string;
	abstract readonly contextNode: EvaluationContextNode<Definition>;

	// EvaluationContext: node-relative
	abstract getSubscribableDependencyByReference(reference: string): SubscribableDependency | null;

	// Subscribable: node-specific
	abstract subscribe(): void;
	abstract unsubscribe?(): void;

	constructor(engineConfig: InstanceConfig, definition: Definition) {
		this.engineConfig = engineConfig;
		this.nodeId = engineConfig.createUniqueId();
		this.definition = definition;
	}
}
