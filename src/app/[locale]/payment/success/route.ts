type PaymentReturnContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: PaymentReturnContext) {
  const { locale } = await context.params;
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(`/${locale}/credits`, requestUrl.origin);
  const sessionId = requestUrl.searchParams.get("session_id");

  redirectUrl.searchParams.set("checkout", "success");
  if (sessionId) redirectUrl.searchParams.set("session_id", sessionId);

  return Response.redirect(redirectUrl, 307);
}
