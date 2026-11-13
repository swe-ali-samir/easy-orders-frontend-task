/** Store-wide business rules (not API configuration — that lives in services/config.ts). */

/** Shown when the product has no custom currency (the store is Egyptian). */
export const DEFAULT_CURRENCY = 'EGP';

/** Per-line quantity cap; also the cap when stock is not tracked. */
export const DEFAULT_MAX_QUANTITY = 10;
