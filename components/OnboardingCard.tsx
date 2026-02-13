import { FormEvent, useState } from "react";

type OnboardingCardProps = {
  onSubmit: (nickname: string) => void;
};

export default function OnboardingCard({ onSubmit }: OnboardingCardProps) {
  const [nickname, setNickname] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(nickname);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
      <h2 className="text-2xl font-bold text-slateBlue">Start your first mission</h2>
      <p className="mt-2 max-w-xl text-slate-600">
        Pick a nickname. No email, no account, no personal details.
      </p>

      <form className="mt-5 flex max-w-md flex-col gap-3" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-slate-700" htmlFor="nickname">
          Nickname
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900"
          placeholder="CircuitNinja"
          maxLength={24}
          required
        />
        <button
          type="submit"
          className="mt-1 rounded-xl bg-coral px-4 py-3 font-bold text-white transition hover:brightness-110"
        >
          Enter Mission Control
        </button>
      </form>
    </section>
  );
}

