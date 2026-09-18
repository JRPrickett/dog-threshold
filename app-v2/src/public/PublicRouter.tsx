import { PublicSite } from "./PublicSite";
import { BrandWordmark } from "../brand/BrandMark";

function InfoPage({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <a className="marketing-brand" href="/" aria-label="SettledSolo home">
          <BrandWordmark compact />
        </a>
        <nav aria-label="Public site">
          <a href="/">Home</a>
          <a href="/app/" className="marketing-nav-cta">Open app</a>
        </nav>
      </header>
      <main className="info-page">
        <p className="marketing-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="info-page-copy">{children}</div>
      </main>
    </div>
  );
}

function PrivacyPage() {
  return (
    <InfoPage eyebrow="Privacy" title="Your training record belongs to you.">
      <h2>Local-first by default</h2>
      <p>
        SettledSolo currently stores your dog name, training tracks, session history,
        notes and observed signals on your device. You can use the core app without
        creating an account.
      </p>
      <h2>Product analytics are separate</h2>
      <p>
        Limited aggregate analytics may count events such as app opens and whether a
        session was started or saved, together with basic browser/device information.
        Private training details such as dog names, notes, ratings, durations and
        training history are not sent as product analytics.
      </p>
      <h2>Backups and exports</h2>
      <p>
        You can export a JSON backup and CSV history from the app. Those files are
        created on your device and are yours to store or delete.
      </p>
      <h2>Accounts are optional</h2>
      <p>
        Optional cloud backup and cross-device sync are planned. Before that launches,
        this page will be updated with the relevant account-data, hosting, retention
        and deletion details.
      </p>
      <p className="info-note">
        This privacy summary is part of the public beta preparation and will receive a
        final legal review before general launch.
      </p>
    </InfoPage>
  );
}

function TermsPage() {
  return (
    <InfoPage eyebrow="Terms" title="A training aid, not a diagnosis.">
      <h2>What SettledSolo does</h2>
      <p>
        SettledSolo helps you plan gradual separation-training sessions, time them,
        record observations and review progress.
      </p>
      <h2>What it does not do</h2>
      <p>
        It does not diagnose separation anxiety, provide veterinary care or guarantee
        a behavioural outcome. Generated targets are planning suggestions and can be
        made easier at any time.
      </p>
      <h2>Use observation first</h2>
      <p>
        Return early when your dog shows meaningful concern. Do not use a timer target
        as a reason to continue an absence that is becoming difficult.
      </p>
      <h2>Professional support</h2>
      <p>
        Seek veterinary or appropriately qualified behavioural support for severe,
        escalating or persistent distress, self-injury risk, destructive escape
        behaviour or whenever you are unsure how to proceed safely.
      </p>
      <p className="info-note">
        Full launch terms will be finalised before public beta accounts or paid
        features are introduced.
      </p>
    </InfoPage>
  );
}

function HelpPage() {
  return (
    <InfoPage eyebrow="Help" title="Keep the next step calm and manageable.">
      <h2>Start with something already comfortable</h2>
      <p>
        Do not deliberately leave until your dog becomes distressed to discover a
        maximum. Start from a duration you have already observed them cope with calmly.
      </p>
      <h2>Use a camera when you can</h2>
      <p>
        Direct observation is more useful than guessing what happened while you were
        out of sight.
      </p>
      <h2>Returning early is okay</h2>
      <p>
        The target is a ceiling, not a quota. A shorter relaxed session is useful
        training information.
      </p>
      <h2>If concern appears</h2>
      <p>
        End the absence and make the next session easier. Repeated difficult sessions
        are a reason to reduce difficulty and consider professional support, not to
        push the plan harder.
      </p>
      <a className="marketing-primary info-cta" href="/app/">Open SettledSolo</a>
    </InfoPage>
  );
}

export function PublicRouter() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/privacy") {
    document.title = "Privacy — SettledSolo";
    return <PrivacyPage />;
  }
  if (path === "/terms") {
    document.title = "Terms — SettledSolo";
    return <TermsPage />;
  }
  if (path === "/help") {
    document.title = "Help — SettledSolo";
    return <HelpPage />;
  }

  document.title = "SettledSolo — dog separation training";
  return <PublicSite />;
}
