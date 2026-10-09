import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell detail">
        <h1 className="detail__title">Terms of Use</h1>
        <p className="detail__description">
          Replace this draft with reviewed Terms before public launch. Event details may come from
          third-party sources; always verify ticket and timing information with the organizer.
        </p>
      </main>
    </>
  );
}
