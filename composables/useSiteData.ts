import type { Ref } from 'vue';

export function useSiteData<T>(relativePath: string) {
    const { fetchJson } = useBasePath();
    const data = ref<T | null>(null) as Ref<T | null>;
    const pending = ref(true);
    const error = ref('');

    async function load() {
        pending.value = true;
        error.value = '';

        try {
            data.value = await fetchJson<T>(relativePath);
        } catch (err) {
            error.value = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
        } finally {
            pending.value = false;
        }
    }

    onMounted(load);

    return { data, pending, error, reload: load };
}
