import Link from "next/link";

export const metadata = {
  title: "Terms of Service — All Tier Well",
};

export default function TermsPage() {
  return (
    <div className="py-8 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 23, 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The basics</h2>
        <p className="text-sm leading-relaxed">
          All Tier Well is a free community tool for creating and sharing Taylor
          Swift song tier lists. By using this site, you agree to these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your account</h2>
        <p className="text-sm leading-relaxed">
          You sign in with your Google account. You are responsible for keeping
          your Google account secure. One account per person — do not create
          multiple accounts.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your content</h2>
        <p className="text-sm leading-relaxed">
          Your tier list rankings and profile information belong to you. By making
          your profile public, you grant All Tier Well permission to display your
          rankings and include them in community statistics and comparisons. You can
          make your profile private or delete your account at any time from{" "}
          <Link href="/settings" className="underline hover:text-foreground">
            Settings
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Acceptable use</h2>
        <p className="text-sm leading-relaxed">
          Do not use All Tier Well to:
        </p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>Impersonate others or use misleading display names</li>
          <li>Spam, scrape, or abuse the service or its APIs</li>
          <li>Attempt to access other users&apos; accounts or private data</li>
          <li>Interfere with the operation of the service</li>
        </ul>
        <p className="text-sm leading-relaxed">
          We reserve the right to suspend or delete accounts that violate these
          terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Intellectual property</h2>
        <p className="text-sm leading-relaxed">
          Taylor Swift&apos;s song titles, album names, and album artwork are the
          property of their respective rights holders. All Tier Well is a fan
          project and is not affiliated with, endorsed by, or sponsored by Taylor
          Swift or her representatives.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Disclaimers</h2>
        <p className="text-sm leading-relaxed">
          All Tier Well is provided &ldquo;as is&rdquo; without warranties of any
          kind. We do our best to keep the service running and your data safe, but
          we cannot guarantee uptime or that data will never be lost. Use the
          service at your own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changes to these terms</h2>
        <p className="text-sm leading-relaxed">
          We may update these terms from time to time. Continued use of the service
          after changes constitutes acceptance of the updated terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Privacy</h2>
        <p className="text-sm leading-relaxed">
          Your use of All Tier Well is also governed by our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
