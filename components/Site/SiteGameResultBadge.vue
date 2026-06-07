<template>
    <span
        class="bmc-game-result"
        :class="[`is-${kind}`, sizeClass]"
        :title="meta.description"
        :aria-label="meta.longLabel"
    >
        <span class="bmc-game-result__abbr" aria-hidden="true">{{ meta.abbr }}</span>
        <span class="bmc-game-result__label">{{ meta.label }}</span>
    </span>
</template>

<script setup lang="ts">
import { gameResultMeta, type GameResultKind } from '~/utils/game-result';

const props = withDefaults(
    defineProps<{
        kind: GameResultKind;
        size?: 'sm' | 'md' | 'lg';
    }>(),
    { size: 'md' },
);

const meta = computed(() => gameResultMeta[props.kind]);
const sizeClass = computed(() => (props.size === 'md' ? '' : `is-${props.size}`));
</script>
