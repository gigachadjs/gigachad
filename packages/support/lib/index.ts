export function dasherize(input: string) {
  return input
    .replace(/([A-Z]($|[a-z]))/g, "-$1")
    .replace(/--/g, "-")
    .replace(/^-|-$/, "")
    .toLowerCase();
}
