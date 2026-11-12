/**
 * Safely resolves an asset URL relative to Vite's BASE_URL (`./`).
 * Ensures all image paths resolve identically on localhost, Netlify, and GitHub Pages subpaths.
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return './assets/images/chichawatni_scene_1794225848060.jpg';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  let normalized = path.trim().replace(/^\.\//, '').replace(/^\/+/, '');
  if (normalized.startsWith('images/')) {
    normalized = `assets/${normalized}`;
  }

  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${normalized}`;
}

export const PORTRAIT_IMAGE_PATH = './assets/images/chaudhry_asad_hanif_jutt.jpg';
export const CHICHAWATNI_SCENE_PATH = './assets/images/chichawatni_scene_1794225848060.jpg';
export const ASSEMBLY_IMAGE_PATH = './assets/images/punjab_assembly_1794225863446.jpg';
