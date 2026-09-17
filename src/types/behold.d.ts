// Behold.so's Instagram feed widget (src/app/[locale]/(storefront)/page.tsx)
// is a custom element, not a React component, so TSX needs it declared.
declare namespace JSX {
  interface IntrinsicElements {
    "behold-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      "feed-id": string;
    };
  }
}
