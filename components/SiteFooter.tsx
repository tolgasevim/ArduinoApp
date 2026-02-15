import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>Arduino Quest public pilot - kid-safe by default.</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-3">
          <Link className="font-semibold text-slateBlue hover:underline" href="/privacy">
            Privacy
          </Link>
          <Link className="font-semibold text-slateBlue hover:underline" href="/parents">
            Parents
          </Link>
          <Link className="font-semibold text-slateBlue hover:underline" href="/terms">
            Terms
          </Link>
          <Link className="font-semibold text-slateBlue hover:underline" href="/safety">
            Safety
          </Link>
        </nav>
      </div>
    </footer>
  );
}

