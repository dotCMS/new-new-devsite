export function cleanMarkdown(
  markdownString: string | undefined | null,
  inodeString: string
) {
  if (!markdownString) {
    return "";
  }
  return markdownString
    .replaceAll("${docImage}", "/dA/" + inodeString + "/diagram")
    .replaceAll("</br>", "<br>");
}
