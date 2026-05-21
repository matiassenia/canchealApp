export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>CanchealApp © 2026 · Developed by Matías Senia</p>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/matiassenia"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-700 hover:text-emerald-700 hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/matiassenia"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-700 hover:text-emerald-700 hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
