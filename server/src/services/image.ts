export async function fetchImageByScientificName(name: string) {
  const res = await fetch(
    `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}`
  );

  const data = await res.json();

  return data.results?.[0]?.default_photo?.medium_url || null;
}