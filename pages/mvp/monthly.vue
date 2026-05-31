<script setup lang="ts">
definePageMeta({ title: '월별 MVP' });

await navigateTo({ path: '/mvp', query: { type: 'monthly' } }, { redirectCode: 301 });
</script>
