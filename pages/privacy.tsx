import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Notice"
      description="Arduino Quest is built for child-safe learning with minimal data use."
    >
      <p>
        We do not require accounts, names, email addresses, or phone numbers to use the app in this
        pilot.
      </p>
      <p>
        Mission progress is stored locally in your browser. Clearing browser data can remove local
        progress.
      </p>
      <p>
        We do not run third-party product analytics SDKs in this launch version. Operational logs may
        be used only for uptime and security.
      </p>
      <p>
        Parents or guardians can contact us to ask questions about child privacy handling before wider
        release.
      </p>
    </PolicyLayout>
  );
}

