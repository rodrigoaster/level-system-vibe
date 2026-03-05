'use client';

export default function TarefasSkeleton() {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-white/10" />

      {/* Form skeleton */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-white/10" />
        <div className="mb-4 h-10 w-full animate-pulse rounded-lg bg-white/10" />
        <div className="flex justify-end">
          <div className="h-10 w-36 animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>

      {/* Category grid skeleton */}
      <div className="mb-5">
        <div className="mb-3 h-6 w-32 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
          ))}
        </div>
      </div>

      {/* History skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="mb-4 h-6 w-24 animate-pulse rounded-lg bg-white/10" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-3 h-12 w-full animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    </main>
  );
}
