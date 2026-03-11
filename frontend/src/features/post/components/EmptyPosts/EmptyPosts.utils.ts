export function joinClassName(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
