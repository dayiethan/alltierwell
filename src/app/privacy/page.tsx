import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — All Tier Well",
};

export default function PrivacyPage() {
  return (
    <div className="py-8 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 23, 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What we collect</h2>
        <p className="text-sm leading-relaxed">
          When you sign in with Google, we receive your <strong>name</strong>,{" "}
          <strong>email address</strong>, and <strong>profile picture</strong> from your
          Google account. We store your name and profile picture to display on your
          public profile. Your email address is stored by our authentication provider
          (Supabase Auth) and is not displayed publicly.
        </p>
        <p className="text-sm leading-relaxed">
          We also store the <strong>tier list rankings</strong> you create,{" "}
          <strong>profile settings</strong> you configure (username, display name,
          theme preference, public/private status), and basic{" "}
          <strong>usage events</strong> (profile views, comparisons) to power site
          features like the comparison leaderboard.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">How we use your data</h2>
        <p className="text-sm leading-relaxed">
          Your data is used solely to provide the All Tier Well service: displaying
          your profile, generating tier list comparisons, computing community
          statistics, and generating shareable preview images. We do not sell your
          data, use it for advertising, or share it with third parties beyond what
          is necessary to operate the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Third-party services</h2>
        <p className="text-sm leading-relaxed">
          We use the following third-party services to operate All Tier Well:
        </p>
        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1">
          <li><strong>Supabase</strong> — database and authentication</li>
          <li><strong>Vercel</strong> — hosting and analytics</li>
          <li><strong>Google</strong> — sign-in via OAuth</li>
        </ul>
        <p className="text-sm leading-relaxed">
          Each service has its own privacy policy governing how they handle data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Public vs. private profiles</h2>
        <p className="text-sm leading-relaxed">
          By default, your profile and tier list are public and visible to anyone.
          You can make your profile private in{" "}
          <Link href="/settings" className="underline hover:text-foreground">
            Settings
          </Link>
          , which hides your tier list and rankings from other users. Your username
          and display name remain visible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Cookies</h2>
        <p className="text-sm leading-relaxed">
          We use cookies solely for authentication (keeping you signed in). We do
          not use tracking cookies or third-party advertising cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Data retention and deletion</h2>
        <p className="text-sm leading-relaxed">
          Your data is retained as long as your account exists. You can delete your
          account and all associated data at any time from the{" "}
          <Link href="/settings" className="underline hover:text-foreground">
            Settings
          </Link>{" "}
          page. Account deletion removes your profile, tier list, and comparison
          history.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changes to this policy</h2>
        <p className="text-sm leading-relaxed">
          We may update this policy from time to time. Changes will be reflected on
          this page with an updated date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-sm leading-relaxed">
          If you have questions about this policy or your data, reach out via the{" "}
          <a
            href="https://github.com/dayiethan/alltierwell/issues"
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>
    </div>
  );
}
