/**
 * Renderer JSON-LD inline. Server component: emette uno <script>
 * type="application/ld+json" col contenuto serializzato.
 *
 * Usage: <JsonLd data={buildOrganizationLd()} />
 */
type Props = { data: object | object[] };

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}
