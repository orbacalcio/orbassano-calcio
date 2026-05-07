import { X as TwitterIcon } from "lucide-react";
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
 * footer del drawer mobile. L'ordine e' fissato dal cliente
 * (Instagram in cima per priorita').
 */
export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "threads"
  | "youtube"
  | "twitter"
  | "tiktok";

export type SocialLinks = Partial<Record<SocialPlatform, string | undefined>>;

const ORDER: SocialPlatform[] = [
  "instagram",
  "facebook",
  "threads",
  "youtube",
  "twitter",
  "tiktok",
];

const LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  youtube: "YouTube",
  twitter: "X / Twitter",
  tiktok: "TikTok",
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
    case "twitter":
      return <TwitterIcon size={size} aria-hidden />;
    case "threads":
      return <ThreadsIcon size={size} />;
    case "tiktok":
      return <TikTokIcon size={size} />;
  }
}

export function SocialIcons({
  links,
  className,
  iconSize = 16,
  handle = "@asdorbassanocalcio",
}: {
  links: SocialLinks;
  className?: string;
  iconSize?: number;
  handle?: string;
}) {
  const items = ORDER.filter((p) => Boolean(links[p]));
  return (
    <ul className={cn("flex items-center gap-3", className)}>
      {items.map((p) => (
        <li key={p}>
          <a
            href={links[p]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Seguici su ${LABELS[p]} (${handle})`}
            className={cn(
              "group focus-visible:outline-brand-gold flex h-9 w-9 items-center justify-center rounded-full",
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
