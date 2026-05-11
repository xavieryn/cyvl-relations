import NetworkBackground from '@/components/NetworkBackground';

export default function Page() {
  return (
    <>
      <NetworkBackground />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Cyvl Relations
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
          Relationship intelligence — in progress.
        </p>
      </main>
    </>
  );
}
