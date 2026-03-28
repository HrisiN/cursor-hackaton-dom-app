import { Suspense } from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>{children}</Suspense>;
}
