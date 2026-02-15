import PolicyLayout from "@/components/PolicyLayout";

export default function ParentsPage() {
  return (
    <PolicyLayout
      title="Parents and Guardians"
      description="What families should know about this pilot release."
    >
      <p>
        Arduino Quest is designed for guided learning with no public chat, no user-generated social
        feed, and no in-app external links by default.
      </p>
      <p>
        The default mode is simulator mode, so children can learn safely without hardware. Hardware
        mode is optional and requires Chrome or Edge with HTTPS or localhost.
      </p>
      <p>
        Please supervise any physical electronics setup and use age-appropriate kits with protected
        power sources.
      </p>
      <p>
        This pilot is free and focused on learning outcomes. Monetization and account features are
        intentionally out of scope for launch.
      </p>
    </PolicyLayout>
  );
}

