<template>
  <!-- TODO evaluate the label instead -->
  <label :for="control.reference">{{ (<any>control.label?.parts[0]).textContent }}</label>
  <input type="text" :name="control.reference" :id="control.reference" v-model="state.value" />
</template>

<script setup lang="ts">

import { InputDefinition } from '../../../src/lib/xform/body/control/InputDefinition';
import { ValueNodeState } from '../../../src/lib/xform/state/ValueNodeState';

defineProps<{ readonly control: InputDefinition, readonly state: ValueNodeState }>();

</script>

<style scoped>
input {
  display: block;
  margin-bottom: 20px;
}
</style>