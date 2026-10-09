import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="shell detail">
        <h1 className="detail__title">Page not found</h1>
        <p className="detail__description">
          That page doesn&apos;t exist. <Link href="/">Choose a city</Link> to continue.
        </p>
      </main>
    </>
  );
}
