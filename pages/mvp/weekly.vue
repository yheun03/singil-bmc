<script setup lang="ts">
definePageMeta({ title: '주간 MVP' });

await navigateTo({ path: '/mvp', query: { type: 'weekly' } }, { redirectCode: 301 });
</script>
