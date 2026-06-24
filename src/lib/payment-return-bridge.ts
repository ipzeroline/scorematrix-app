function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function paymentReturnBridgeResponse(targetUrl: URL) {
  const target = targetUrl.toString();
  const targetJson = JSON.stringify(target);
  const targetHtml = escapeHtml(target);

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Returning to ScoreMatrix</title>
    <script>
      window.location.replace(${targetJson});
    </script>
  </head>
  <body>
    <p>Returning to ScoreMatrix...</p>
    <p><a href="${targetHtml}">Continue</a></p>
  </body>
</html>`,
    {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        "Content-Type": "text/html; charset=utf-8",
        Pragma: "no-cache",
      },
    }
  );
}
