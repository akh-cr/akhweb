

export default function StatisticsPage() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;

  if (!umamiUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <p>Statistiky nejsou nastaveny.</p>
        <p className="text-sm mt-2">
          Prosím nastavte <code>NEXT_PUBLIC_UMAMI_URL</code> v .env souboru.
        </p>
      </div>
    );
  }

  // Remove /script.js suffix if present to get the dashboard URL
  const dashboardUrl = umamiUrl.replace(/\/script\.js$/, "");

  return (
    <div className="w-full h-[calc(100vh-4rem)] rounded-lg overflow-hidden border bg-background shadow-sm">
      <iframe
        src={dashboardUrl}
        className="w-full h-full border-0"
        title="Umami Analytics"
        allow="cross-origin-isolated"
      />
    </div>
  );
}
