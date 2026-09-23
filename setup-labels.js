const fs = require("fs");
const f = "C:/projects/open travel/src/app/dashboard/customer/page.tsx";
let s = fs.readFileSync(f, "utf8");

const start = (label) => console.log("--- " + label + " ---");
const done = (m) => console.log("  ok: " + mjpg);
const FAIL = (m) => { throw new Error("ANCHOR FAIL: " + m); };

const n0 = s.length;
start("transform");

// 1. Ensure ServiceCard + ApiServiceDetail are imported
if (!/import \{[^}]*ServiceCard[^}]*\} from ["']@\/components\/service-card["']/.test(s)) {
  s = s.replace(
    /(import \{ ServiceCard \} from ["']@\/components\/service-card["'];?)/,
    "$1"
  );
  if (!s.includes("import { ServiceCard } from")) {
    s = s.replace(
      /import \{ auth \} from ["']@\/auth["'];?/,
      'import { auth } from "@/auth";\nimport { ServiceCard } from "@/components/service-card";'
    );
  }
}
done("ServiceCard import ensured");

if (!/ApiServiceDetail/.test(s)) {
  s = s.replace(
    /apiFetch,\s*type ApiBooking/,
    "apiFetch, type ApiBooking, type ApiServiceDetail"
  );
}
done("ApiServiceDetail type ensured");

// 2. Render the offers grid: insert a section between the stat cards and "My bookings"
const statClose = /(<\/div>\s*<\/div>\s*<Card>\s*<CardHeader>\s*<CardTitle>My bookings<\/CardTitle>)/;
if (statClose.test(s)) {
  const gridBlock = `
      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Discover offers from our agencies
            </h2>
            <p className="mt-1 text-muted-foreground">
              Every service and package published by our partner agencies —
              book in a few clicks.
            </p>
          </div>
        </div>

        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No offers published yet. Check back soon.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My bookings</CardTitle>`;
  s = s.replace(statClose, "</div>\n" + gridBlock);
  done("offers grid inserted before My bookings");
} else {
  FAIL("stat-close->My bookings anchor");
}

// 3. Empty state: remove the two browse buttons, plain message instead
const emptyRe =
  /\{bookings\.length === 0 \? \(([\s\S]*?)<Link[^>]*>([\s\S]*?)<\/Link>([\s\S]*?)<\/p>\)/;
if (emptyRe.test(s)) {
  s = s.replace(
    emptyRe,
    `{bookings.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              You have no bookings yet. Pick any agency offer above on this
              page to book your first trip.
            </p>`
  );
  done("empty state buttons removed");
} else {
  FAIL("empty-state anchor");
}

fs.writeFileSync(f, s);
console.log("WROTE " + f + " (" + n0 + " -> " + s.length + " chars)");
