import { BrandMark, BrandWordmark } from "../brand/BrandMark";

export function PublicSite() {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <a className="marketing-brand" href="/" aria-label="SettledSolo home">
          <BrandWordmark compact />
        </a>
        <nav aria-label="Public site">
          <a href="#how-it-works">How it works</a>
          <a href="#why-settledsolo">Why SettledSolo</a>
          <a href="/app/" className="marketing-nav-cta">Open app</a>
        </nav>
      </header>

      <main>
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <p className="marketing-eyebrow">Separation training for dogs</p>
            <h1>Calm starts with small steps.</h1>
            <p className="marketing-lead">
              Build comfortable alone time gradually, with an explainable plan,
              a reliable session timer and a private record of what your dog
              actually experienced.
            </p>
            <div className="marketing-actions">
              <a className="marketing-primary" href="/app/">Start training free</a>
              <a className="marketing-secondary" href="#how-it-works">See how it works</a>
            </div>
            <p className="marketing-fineprint">
              No account required. Your training can start locally on this device.
            </p>
          </div>

          <div className="marketing-hero-art" aria-hidden="true">
            <div className="marketing-door-scene">
              <BrandMark />
              <span className="marketing-glow-line" />
              <div className="marketing-scene-copy">
                <strong>SettledSolo</strong>
                <span>Build comfortable alone time, gradually.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-trust-strip" aria-label="Product principles">
          <div><strong>Evidence-aware</strong><span>Principles grounded in gradual desensitisation.</span></div>
          <div><strong>Dog-first</strong><span>The target is a ceiling, never a quota.</span></div>
          <div><strong>Private by design</strong><span>Core training works locally without an account.</span></div>
          <div><strong>Built for real life</strong><span>Offline sessions and interruption recovery.</span></div>
        </section>

        <section className="marketing-section" id="how-it-works">
          <div className="marketing-section-heading">
            <p className="marketing-eyebrow">How it works</p>
            <h2>A training loop that stays simple.</h2>
            <p>
              SettledSolo keeps the focus on observation and comfort rather than
              chasing increasingly large numbers.
            </p>
          </div>

          <div className="marketing-steps">
            <article>
              <span>01</span>
              <h3>Start below worry.</h3>
              <p>Choose a duration you have already seen your dog manage calmly.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Train and observe.</h3>
              <p>Use a camera when you can, return early if concern appears, and log what you saw.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Adapt the next step.</h3>
              <p>The next plan is explained in plain English and becomes easier when difficulty appears.</p>
            </article>
          </div>
        </section>

        <section className="marketing-app-preview" id="why-settledsolo">
          <div className="marketing-preview-copy">
            <p className="marketing-eyebrow">A calmer product, too</p>
            <h2>Designed for the moment you actually leave.</h2>
            <p>
              The everyday app is light and quiet. Start a live session and it
              shifts into the dusk interface: large timer, minimal distractions,
              return cues and recovery if the browser is interrupted.
            </p>
            <ul>
              <li>Explainable recommendations</li>
              <li>Relaxed / some concern / distressed review</li>
              <li>Observed-signal tracking without heavy journalling</li>
              <li>JSON backup, restore and CSV export</li>
              <li>Installable PWA, no app-store barrier</li>
            </ul>
          </div>

          <div className="marketing-phone" aria-label="SettledSolo Today screen preview">
            <div className="marketing-phone-top" />
            <div className="marketing-phone-content">
              <p>Good morning</p>
              <h3>You &amp; Biscuit</h3>
              <div className="marketing-phone-card">
                <span>Today's practice</span>
                <strong>1:20</strong>
                <small>Suggested absence</small>
                <p>A small step from your last comfortable session.</p>
              </div>
              <button type="button" tabIndex={-1}>Start session</button>
            </div>
          </div>
        </section>

        <section className="marketing-quote">
          <BrandMark compact />
          <blockquote>
            “Progress isn't how long you're gone. It's how settled your dog
            feels while you're away.”
          </blockquote>
        </section>

        <section className="marketing-section marketing-evidence">
          <div className="marketing-section-heading">
            <p className="marketing-eyebrow">Evidence-aware, not algorithm worship</p>
            <h2>Transparent about what science can and cannot tell us.</h2>
          </div>
          <div className="marketing-evidence-grid">
            <p>
              SettledSolo uses established behaviour-change principles such as
              gradual systematic desensitisation and direct observation.
            </p>
            <p>
              Exact step sizes are conservative product heuristics, not presented
              as a clinically proven formula. Every recommendation should be
              understandable and easy to override.
            </p>
          </div>
        </section>

        <section className="marketing-final-cta">
          <BrandMark />
          <h2>Build comfortable alone time, gradually.</h2>
          <p>Start with one calm, manageable step. No account required.</p>
          <a className="marketing-primary" href="/app/">Open SettledSolo</a>
        </section>
      </main>

      <footer className="marketing-footer">
        <BrandWordmark compact />
        <div>
          <span>SettledSolo is a training and record-keeping aid, not a diagnosis.</span>
          <span>Built by South West Websites.</span>
        </div>
      </footer>
    </div>
  );
}
