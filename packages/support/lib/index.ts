export function dasherize(input: string) {
  return input
    .replace(/([A-Z]($|[a-z]))/g, "-$1")
    .replaceAll("_", "-")
    .replace(/--/g, "-")
    .replace(/-+$/, "")
    .replace(/^-+/, "")
    .toLowerCase();
}
