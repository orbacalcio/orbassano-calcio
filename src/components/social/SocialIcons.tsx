import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/BrandIcons";
import { ThreadsIcon } from "@/components/icons/ThreadsIcon";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { cn } from "@/lib/cn";

/**
 * Icone social riusabili: appaiono nella sidebar destra desktop e nel
 * footer del drawer mobile. Ordine fissato dal cliente: Instagram in
 * cima per priorita', Threads in fondo (canale piu' recente / minore
 * priorita' di lettura). X/Twitter rimosso 2026-05-17 — il club non
 * presidia piu' la piattaforma.
 */
export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "threads";

export type SocialLinks = Partial<Record<SocialPlatform, string | undefined>>;

const ORDER: SocialPlatform[] = [
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "threads",
];

const LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  threads: "Threads",
};

function PlatformIcon({
  platform,
  size = 20,
}: {
  platform: SocialPlatform;
  size?: number;
}) {
  switch (platform) {
    case "instagram":
      return <InstagramIcon size={size} />;
    case "facebook":
      return <FacebookIcon size={size} />;
    case "youtube":
      return <YoutubeIcon size={size} />;
    case "tiktok":
      return <TikTokIcon size={size} />;
    case "threads":
      return <ThreadsIcon size={size} />;
  }
}

export function SocialIcons({
  links,
  className,
  iconSize = 20,
  handle = "@asdorbassanocalcio",
}: {
  links: SocialLinks;
  className?: string;
  iconSize?: number;
  handle?: string;
}) {
  const items = ORDER.filter((p) => Boolean(links[p]));
  return (
    <ul className={cn("flex items-center gap-3.5", className)}>
      {items.map((p) => (
        <li key={p}>
          <a
            href={links[p]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Seguici su ${LABELS[p]} (${handle})`}
            className={cn(
              "group focus-visible:outline-brand-gold flex h-11 w-11 items-center justify-center rounded-full",
              "border-ink-mid/40 hover:bg-ink-hi hover:border-ink-hi border transition-all duration-300",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
            )}
          >
            <span className="text-ink-hi group-hover:text-surface-0 inline-flex items-center justify-center transition-colors duration-300">
              <PlatformIcon platform={p} size={iconSize} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
