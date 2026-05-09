/**
 * Custom element <behold-widget> esposto da https://w.behold.so/widget.js
 * per l'embed dei feed Instagram. Lo dichiariamo come elemento JSX
 * cosi' TypeScript non si lamenta quando lo usiamo nei componenti.
 */
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "behold-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "feed-id"?: string;
      };
    }
  }
}
