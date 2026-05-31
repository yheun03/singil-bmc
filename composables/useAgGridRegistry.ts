import type { GridApi } from 'ag-grid-community';

const registry = new Map<string, GridApi>();

export function useAgGridRegistry() {
    function register(id: string, api: GridApi) {
        registry.set(id, api);
    }

    function unregister(id: string) {
        registry.delete(id);
    }

    function getApi(id: string) {
        return registry.get(id);
    }

    return {
        register,
        unregister,
        getApi,
    };
}
