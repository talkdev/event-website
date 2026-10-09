import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell detail">
        <h1 className="detail__title">About SceneAround</h1>
        <p className="detail__description">
          SceneAround is a practical guide to what&apos;s happening across Indian cities. We focus
          on clear dates, trustworthy listings, and a fast mobile experience — without clutter or
          forced accounts.
        </p>
      </main>
    </>
  );
}
