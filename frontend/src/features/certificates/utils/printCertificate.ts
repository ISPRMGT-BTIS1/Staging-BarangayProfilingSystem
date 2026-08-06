/**
 * printCertificate
 *
 * Opens a clean popup window that contains ONLY the certificate DOM node,
 * then triggers window.print() on that popup.
 *
 * This avoids the browser inserting the page title, date/time, and URL
 * into the printed output (those only appear when printing the main window).
 *
 * @param elementId  - The `id` attribute on the root div of the certificate
 *                     preview (e.g. "abc-print-root", "oath-print-root").
 */
export function printCertificate(elementId: string): void {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`[printCertificate] No element found with id="${elementId}"`);
    window.print();
    return;
  }

  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) {
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title></title>
  <style>
    @page { size: letter portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body > * { margin: 0.5in auto; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  ${el.outerHTML}
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();

  popup.onload = () => {
    setTimeout(() => {
      popup.focus();
      popup.print();
      popup.close();
    }, 300);
  };

  // Fallback if onload does not fire
  setTimeout(() => {
    try {
      if (!popup.closed) {
        popup.focus();
        popup.print();
        popup.close();
      }
    } catch (_) {}
  }, 1200);
}
