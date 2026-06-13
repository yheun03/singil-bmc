<script setup lang="ts">
definePageMeta({ title: '연도별 MVP' });

await navigateTo({ path: '/mvp', query: { type: 'yearly' } }, { redirectCode: 301 });
</script>
