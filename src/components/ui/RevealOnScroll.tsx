/**
 * Wrapper passthrough. In passato applicava un fade + translateY al
 * primo ingresso in viewport per dare "respiro" ai blocchi editoriali,
 * ma l'animazione creava un effetto "salto verso l'alto" sgradevole
 * specie sul primo scroll-down della home. Disabilitato a livello di
 * componente: tutti i siti chiamanti restano invariati, l'unica cosa
 * che cambia e' che il children viene renderizzato statico.
 *
 * Le prop `amount` e `delay` sono accettate per backward compat ma
 * ignorate. Mantenuto come componente neutro per non dover refattorare
 * i 17 file che lo importano.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
  delay?: number;
}) {
  if (className) return <div className={className}>{children}</div>;
  return <>{children}</>;
}
