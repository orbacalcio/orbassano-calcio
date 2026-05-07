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
    <ul className={cn("flex items-center gap-3", className)}>
      {items.map((p) => (
        <li key={p}>
          <a
            href={links[p]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Seguici su ${LABELS[p]} (${handle})`}
            className="text-ink-mid hover:text-brand-gold focus-visible:outline-brand-gold flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <PlatformIcon platform={p} size={iconSize} />
          </a>
        </li>
      ))}
    </ul>
  );
}
