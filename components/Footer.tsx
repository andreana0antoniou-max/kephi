export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-20">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink/70">
        <p className="font-heading text-ink font-semibold">Kephi</p>
        <p>Bringing the κέφι to every event, UK-wide.</p>
        <p>&copy; {new Date().getFullYear()} Kephi</p>
      </div>
    </footer>
  );
}
