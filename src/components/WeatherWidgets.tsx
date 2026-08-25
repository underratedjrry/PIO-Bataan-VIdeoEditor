// Free public iframe embeds (no API key) - if either provider ever blocks
// framing, the "Open in ..." link alongside it still works as a fallback.
export function WeatherWidgets({ lat, lng }: { lat: number; lng: number }) {
  const windyUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lng}&detailLat=${lat}&detailLon=${lng}&zoom=8&level=surface&overlay=rain&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  const windyLink = `https://www.windy.com/?rain,${lat},${lng},8`;

  const zoomEarthUrl = `https://zoom.earth/maps/satellite/#view=${lat},${lng},8z`;
  const zoomEarthLink = `https://zoom.earth/maps/satellite/#view=${lat},${lng},8z`;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <WidgetCard title="Rain Radar (Windy)" iframeSrc={windyUrl} externalLink={windyLink} />
      <WidgetCard
        title="Satellite (Zoom Earth)"
        iframeSrc={zoomEarthUrl}
        externalLink={zoomEarthLink}
      />
    </div>
  );
}

function WidgetCard({
  title,
  iframeSrc,
  externalLink,
}: {
  title: string;
  iframeSrc: string;
  externalLink: string;
}) {
  return (
    <div className="border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b-2 border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <p className="nav-label text-slate-700 dark:text-slate-300">{title}</p>
        <a
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#0036AF] underline dark:text-[#4d7fff]"
        >
          Open full view
        </a>
      </div>
      <iframe
        src={iframeSrc}
        title={title}
        loading="lazy"
        className="h-[360px] w-full border-0"
      />
    </div>
  );
}
