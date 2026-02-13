import { PropsWithChildren } from "react";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl bg-slateBlue px-6 py-8 text-white shadow-card md:px-10">
          <p className="text-sm uppercase tracking-[0.18em] text-sky">Arduino Quest</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-100 md:text-lg">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );
}

