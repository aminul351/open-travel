import Link from "next/link";
import { CheckCircle2, Globe2, Plane, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <Plane className="size-4 -rotate-12" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Open Travel
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The premier marketplace connecting travelers directly with verified tour operators, hotels, and transportation agencies worldwide.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>100% Verified Agency Network</span>
            </div>
          </div>

          {/* Marketplace Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services" className="text-muted-foreground transition-colors hover:text-foreground">
                  All Agency Offers
                </Link>
              </li>
              <li>
                <Link href="/services?type=PACKAGE" className="text-muted-foreground transition-colors hover:text-foreground">
                  Curated Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/services?type=HOTEL" className="text-muted-foreground transition-colors hover:text-foreground">
                  Hotels &amp; Stays
                </Link>
              </li>
              <li>
                <Link href="/services?type=TRANSPORTATION" className="text-muted-foreground transition-colors hover:text-foreground">
                  Airport &amp; Local Transport
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-muted-foreground transition-colors hover:text-foreground">
                  Guided Excursions
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner with Us Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              For Agencies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register?role=AGENCY" className="text-muted-foreground transition-colors hover:text-foreground font-medium text-primary">
                  List Your Offerings →
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Agency Partner Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard/agency" className="text-muted-foreground transition-colors hover:text-foreground">
                  Agency Management Hub
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Fast Verification Process
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Trust &amp; Confidence
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every listing is published directly by verified agencies. Communicate, inquire, and book with direct message guarantees.
            </p>
            <div className="rounded-xl border bg-background/60 p-3 text-xs space-y-1">
              <div className="font-semibold text-foreground">Direct Agency Messaging</div>
              <p className="text-muted-foreground text-[11px]">
                Chat directly with local operators before, during, and after booking.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Open Travel Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Globe2 className="size-3.5" />
              Global Edition · USD ($)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}