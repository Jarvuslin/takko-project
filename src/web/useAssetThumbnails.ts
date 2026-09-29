import { useEffect, useRef, useState } from "react";
/** Bounded batches shared by both browsers. Preview changes do not refetch thumbnails. */
export function useAssetThumbnails(ids: string[]) {
  const [images, setImages] = useState<Record<string, string>>({});
  const attempted = useRef(new Set<string>());
  const key = [...new Set(ids)].join(",");
  useEffect(() => {
    let active = true;
    const missing = key
      .split(",")
      .filter((id) => id && !attempted.current.has(id));
    void (async () => {
      for (let i = 0; active && i < missing.length; i += 20) {
        const batch = missing.slice(i, i + 20);
        try {
          const r = await fetch(
            "/api/marketplace/thumbnails?ids=" + batch.join(","),
          );
          if (!r.ok) continue;
          const data = await r.json();
          if (active) {
            batch.forEach((id) => attempted.current.add(id));
            setImages((old) => ({ ...old, ...data }));
          }
        } catch {
          /* Static thumbnails never block browsing. */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [key]);
  return images;
}
