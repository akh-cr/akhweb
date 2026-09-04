export const TRANSIENT_IMAGE_ERROR =
  'Nahrávání obrázku ještě není dokončeno. Počkejte prosím a uložte obsah znovu.'

const TRANSIENT_IMAGE_SOURCE = /\bsrc\s*=\s*(["'])blob:/i

export function hasTransientImageSource(value: unknown): boolean {
  return typeof value === 'string' && TRANSIENT_IMAGE_SOURCE.test(value)
}

export function assertNoTransientImageSource(value: unknown): void {
  if (hasTransientImageSource(value)) {
    throw new Error(TRANSIENT_IMAGE_ERROR)
  }
}
