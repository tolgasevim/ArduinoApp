import PolicyLayout from "@/components/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms of Use" description="Pilot terms for Arduino Quest.">
      <p>
        Arduino Quest is provided for educational use during this pilot period. Features can change as
        we improve the product.
      </p>
      <p>
        Users should not attempt to bypass browser safety prompts, hardware restrictions, or platform
        security controls.
      </p>
      <p>
        Hardware mode is optional. We are not responsible for damage caused by improper wiring or
        unsupported hardware modifications.
      </p>
      <p>
        We may suspend access if usage is abusive, harmful, or violates child-safety expectations.
      </p>
    </PolicyLayout>
  );
}

