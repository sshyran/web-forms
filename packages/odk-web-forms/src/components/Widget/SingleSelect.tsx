import { createMemo, For, Show } from 'solid-js';
import { FormControlLabel, Radio, RadioGroup } from 'suid/material';
import type { SelectState } from '../../lib/xform/state/select/SelectState.ts';
import type { Select1Definition } from '../XForm/controls/SelectControl.tsx';
import { XFormControlLabel } from '../XForm/controls/XFormControlLabel.tsx';

export interface SingleSelectProps {
	readonly control: Select1Definition;
	readonly state: SelectState;
}

export const SingleSelect = (props: SingleSelectProps) => {
	const isDisabled = createMemo(() => {
		return props.state.isReadonly() === true || props.state.isRelevant() === false;
	});

	return (
		<RadioGroup name={props.state.reference}>
			<Show when={props.control.label} keyed={true}>
				{(label) => {
					return <XFormControlLabel state={props.state} label={label} />;
				}}
			</Show>
			<For each={props.state.items()}>
				{(item) => {
					return (
						<FormControlLabel
							value={item.value}
							control={
								<Radio
									checked={props.state.isSelected(item)}
									onChange={(_, checked) => {
										if (checked) {
											props.state.selectExclusive(item);
										} else {
											props.state.deselect(item);
										}
									}}
								/>
							}
							label={item.label()}
							disabled={isDisabled()}
						/>
					);
				}}
			</For>
		</RadioGroup>
	);
};
