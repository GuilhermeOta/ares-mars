import { useEffect, useState } from 'react';
import { LAYERS_MANIFEST_URL } from '../config/mapConfig';

export default function useLayerManifest() {
  const [state, setState] = useState({ status: 'loading', base: null, layers: [] });

  useEffect(() => {
    let cancelled = false;
    // pasta onde está o manifest, para montar a URL de cada imagem
    const folder = LAYERS_MANIFEST_URL.slice(0, LAYERS_MANIFEST_URL.lastIndexOf('/') + 1);

    fetch(LAYERS_MANIFEST_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const all = (json.layers || [])
          .filter((l) => l.image && Array.isArray(l.bounds))
          .map((l) => ({ ...l, url: folder + l.image }));
        setState({
          status: 'ok',
          base: all.find((l) => l.filter === 'base') || null,
          layers: all.filter((l) => l.filter !== 'base'),
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'missing', base: null, layers: [] });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}