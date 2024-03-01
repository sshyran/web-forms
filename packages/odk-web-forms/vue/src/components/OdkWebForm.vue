<template>
  <XFormView :entry="re" />
</template>

<script setup lang="ts">
import { onUnmounted, reactive } from 'vue';
import { Engine } from '../../../src/lib/xform/Engine';

import XFormView from './XFormView.vue';

const props = defineProps<{ xform: string }>();

const f = <T extends object>(target: T): T => {
  return reactive(target) as T;
}
const engine = new Engine(props.xform, f);

const re = engine.reactiveEntry;

onUnmounted(() => {
  engine[Symbol.dispose]();
})

</script>

<style scoped></style>