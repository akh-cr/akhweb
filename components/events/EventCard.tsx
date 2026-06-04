import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

import { Event } from "@/lib/events/types";
import { getOrganizerTagPresentation } from "@/lib/event-organizer-colors";
import { shouldShowOrganizerBadge } from "@/lib/events/display";

/**
 * Shared event card used by both /akce (AKH) and /pozvanky (external invitations).
 * AKH events carry no organizer badge; external invitations show the organizer tag.
 */
export function EventCard({ event }: { event: Event }) {
  const showBadge = shouldShowOrganizerBadge(event);
  const organizerTag = getOrganizerTagPresentation(event.event_organizers?.color_hex, false);
  const organizerLabel = event.event_organizers?.name || "Pořadatel";

  return (
    <Link
      key={event.id}
      href={`/akce/${event.slug || "#"}`}
      className={`flex flex-col h-full bg-card rounded-xl border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group ${!event.slug ? "pointer-events-none opacity-80" : ""}`}
    >
      {event.image_url ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted/50 flex items-center justify-center border-b">
          <MapPin className="h-10 w-10 text-muted-foreground/20" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {new Date(event.start_time).toLocaleDateString("cs-CZ")}
          </span>
          {showBadge && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${organizerTag.className}`}
              style={organizerTag.style}
            >
              {organizerLabel}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        {event.location && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
          {event.description || ""}
        </p>

        <div className="flex items-center text-primary font-medium text-sm mt-auto group-hover:underline underline-offset-4 decoration-primary/30">
          {event.gallery_images && event.gallery_images.length > 0 ? "Prohlédnout fotky" : "Zobrazit podrobnosti"}{" "}
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
