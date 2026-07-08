import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
      {/* Giant blurred 404 */}
      <div className="relative mb-8 select-none">
        <p className="font-mono text-[128px] font-extrabold leading-none tracking-tighter text-white/[0.03]">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-glow-pulse h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/5">
            <svg className="h-9 w-9 text-amber-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-white">Page not found</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-white/40">
        This page doesn&apos;t exist or may have been moved. Your AI agent is still ready to help on the dashboard.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-5 py-2.5 text-[14px] font-bold text-black shadow-glow-amber transition-all duration-300 ease-expo hover:scale-[1.02]"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
          </svg>
          Go to Dashboard
        </Link>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-[14px] font-semibold text-white/60 transition-all duration-300 hover:bg-white/[0.06] hover:text-white/90"
        >
          Open Chat
        </Link>
      </div>
    </div>
  );
}
