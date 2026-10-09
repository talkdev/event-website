import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell detail">
        <h1 className="detail__title">Privacy Policy</h1>
        <p className="detail__description">
          Replace this draft with a reviewed Privacy Policy before public launch. SceneAround v1
          does not offer public user accounts. Analytics and operational logs should be disclosed
          here once chosen.
        </p>
      </main>
    </>
  );
}
