export const BOOT_STORAGE_KEY = "ba-booted";

/**
 * Runs before first paint (inlined in layout.tsx) so the boot overlay is either shown from
 * the very first frame or never shown: no flash of page content, no flash of overlay.
 */
export const BOOT_PREPAINT_SCRIPT = `try{var s=sessionStorage.getItem('${BOOT_STORAGE_KEY}')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.boot=s?'skip':'run'}catch(e){document.documentElement.dataset.boot='skip'}`;
