/** Enlace de salto al contenido principal (WCAG 2.4.1). */
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a href={href} className="skip-link">
      Saltar al contenido principal
    </a>
  )
}
