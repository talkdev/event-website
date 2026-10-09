import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell detail">
        <h1 className="detail__title">Contact</h1>
        <p className="detail__description">
          For corrections, source partnerships, or press: replace this page with your public contact
          email before launch.
        </p>
      </main>
    </>
  );
}
