import PolicyLayout from "@/components/PolicyLayout";

export default function SafetyPage() {
  return (
    <PolicyLayout title="Safety Guidelines" description="Safety first for coding and hardware lessons.">
      <p>Always start in simulator mode and move to hardware only with supervision.</p>
      <p>Disconnect USB power before changing wires or components on real boards.</p>
      <p>Use only recommended voltages and beginner kits with known-good cables.</p>
      <p>Stop immediately if components overheat, smell unusual, or behave unexpectedly.</p>
    </PolicyLayout>
  );
}

