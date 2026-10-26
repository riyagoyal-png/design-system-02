import { useEffect, useState } from 'react';

/** Hash routing ("#/components/button"): deep-linkable and deployable as static files with no rewrites. */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h.split('?')[0] : '/';
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const on = () => setPath(currentPath());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

export function href(path: string): string {
  return `#${path}`;
}
