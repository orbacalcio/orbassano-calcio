/**
 * Renderer JSON-LD inline. Server component: emette uno <script>
 * type="application/ld+json" col contenuto serializzato.
 *
 * Sicurezza: `JSON.stringify` non scappa `<` di default, quindi una
 * stringa contenente `</script>` dentro un campo CMS (es. title
 * news) potrebbe chiudere il tag <script> e iniettare HTML. Sostituiamo
 * `<` con la sequenza unicode `<` — JSON valida, non interpretata
 * come tag dal parser HTML.
 *
 * Usage: <JsonLd data={buildOrganizationLd()} />
 */
type Props = { data: object | object[] };

export function JsonLd({ data }: Props) {
  const safe = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
