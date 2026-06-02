export function getYoutubeId(url: string) {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/
  );

  return match?.[1] || "";
}

export function getYoutubeThumbnailUrl(url: string) {
  const videoId = getYoutubeId(url);

  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";
}

export function getRankingStatusClass(estado: string) {
  const status = estado?.toLowerCase();

  if (status === "campeon") return "bg-yellow-400 text-black";
  if (status === "clasificado") return "bg-green-400/10 text-green-300";
  if (status === "eliminado") return "bg-red-400/10 text-red-300";

  return "bg-white/10 text-gray-300";
}

export function isTruthyConfig(value: unknown) {
  return (
    value === true ||
    String(value ?? "")
      .trim()
      .toLowerCase() === "true"
  );
}