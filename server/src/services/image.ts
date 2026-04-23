const imageCache = new Map<string, string | null>();

export async function fetchImageByScientificName(name: string) {
  if (imageCache.has(name)) {
    return imageCache.get(name);
  }

  try {
    const res = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}`
    );

    if (!res.ok) {
      if (res.status !== 429) {
        console.error("Image API HTTP error:", res.status);
      }
      imageCache.set(name, null);
      return null;
    }

    const text = await res.text();

    if (!text || text.trim().startsWith("<")) {
      imageCache.set(name, null);
      return null;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      imageCache.set(name, null);
      return null;
    }

    const image = data.results?.[0]?.default_photo?.medium_url || null;
    imageCache.set(name, image);
    return image;
  } catch (error) {
    console.error("Fetch image failed for:", name, error);
    imageCache.set(name, null);
    return null;
  }
}
