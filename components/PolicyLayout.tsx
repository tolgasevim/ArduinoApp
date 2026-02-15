import Head from "next/head";
import Link from "next/link";
import type { PropsWithChildren } from "react";

type PolicyLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export default function PolicyLayout({ title, description, children }: PolicyLayoutProps) {
  return (
    <>
      <Head>
        <title>{title} | Arduino Quest</title>
        <meta name="description" content={description} />
      </Head>
      <div className="min-h-screen p-4 md:p-8">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <Link
            href="/"
            className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slateBlue"
          >
            Back to app
          </Link>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
            <h1 className="text-3xl font-black text-slateBlue">{title}</h1>
            <p className="mt-2 text-slate-600">{description}</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">{children}</div>
          </article>
        </main>
      </div>
    </>
  );
}

