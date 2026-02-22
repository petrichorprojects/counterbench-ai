import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">COUNTERBENCH</div>
            <div className="footer__sub">A directory for legal AI</div>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "1rem", maxWidth: 360 }}>
              Curated tools, prompts, and skills for paralegals, solo attorneys, and legal research teams.
            </p>
          </div>
          <div>
            <div className="footer__heading">Library</div>
            <Link className="footer__link" href="/tools">
              Tools
            </Link>
            <Link className="footer__link" href="/tools/collections">
              Collections
            </Link>
            <Link className="footer__link" href="/prompts">
              Prompts
            </Link>
            <Link className="footer__link" href="/skills">
              Skills
            </Link>
            <Link className="footer__link" href="/tools/compare">
              Compare
            </Link>
          </div>
          <div>
            <div className="footer__heading">Company</div>
            <Link className="footer__link" href="/about">
              About
            </Link>
            <Link className="footer__link" href="/insights">
              Insights
            </Link>
            <Link className="footer__link" href="/contact">
              Contact
            </Link>
            <Link className="footer__link" href="/advisory">
              AI Advisory
            </Link>
          </div>
          <div>
            <div className="footer__heading">Newsletter</div>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Weekly roundup of tool changes, prompt packs, and workflow templates.
            </p>
            <Link className="btn btn--secondary btn--sm" href="/newsletter">
              Subscribe
            </Link>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="footer__copy">© {new Date().getFullYear()} Counterbench.AI</div>
          <div className="footer__legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/eula">EULA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
