"use client";

import Link from "next/link";
import { DomScore } from "./DomScore";

interface ListingCardProps {
  id: string;
  price: string;
  beds: number;
  size: number;
  neighbourhood: string;
  domScore: number;
  imageColor: string;
  radiusVariant: 1 | 2 | 3;
  image?: string;
  title?: string;
  dealType?: "rent" | "sale";
}

const RADIUS_CLASSES: Record<1 | 2 | 3, string> = {
  1: "rounded-[2rem_2rem_2rem_3rem]",
  2: "rounded-[2.5rem_2rem_2rem_2rem]",
  3: "rounded-[2rem_3rem_2rem_2rem]",
};

export function ListingCard({
  id,
  price,
  beds,
  size,
  neighbourhood,
  domScore,
  imageColor,
  radiusVariant,
  image,
  title,
  dealType,
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`}>
      <div
        className={`group relative border border-dom-border/60 bg-dom-card shadow-moss transition-all duration-350 hover:-translate-y-1 hover:shadow-clay hover:border-dom-primary/30 ${RADIUS_CLASSES[radiusVariant]} overflow-hidden`}
      >
        {/* Image area */}
        <div
          className="relative h-[120px] w-full overflow-hidden"
          style={{ backgroundColor: imageColor }}
        >
          {image && (
            <img
              src={image}
              alt={title ?? "Listing"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute top-3 right-3">
            <DomScore score={domScore} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {title && (
            <p className="font-nunito font-500 text-xs text-dom-muted-fg line-clamp-1">{title}</p>
          )}
          <p className="font-fraunces font-700 text-lg text-dom-fg">{price}</p>
          <p className="font-nunito font-400 text-xs text-dom-muted-fg">
            {beds} {beds === 1 ? "soba" : "sobe"} · {size} m²
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex rounded-full border border-dom-primary/20 bg-dom-primary-light px-2.5 py-1 font-nunito font-700 text-[10px] text-dom-primary">
              {neighbourhood}
            </span>
            <span className="font-nunito text-[10px] text-dom-border">
              {size} m²
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
