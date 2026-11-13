interface PersistedStore {
  persist: { rehydrate: () => Promise<void> | void };
}

/**
 * Keeps a persisted Zustand store in sync across browser tabs. The browser fires
 * `storage` only in *other* tabs, so a change in one tab rehydrates the rest instead of
 * a stale tab overwriting it on its next write.
 */
export function syncAcrossTabs(store: PersistedStore, storageKey: string): void {
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) {
      void store.persist.rehydrate();
    }
  });
}
