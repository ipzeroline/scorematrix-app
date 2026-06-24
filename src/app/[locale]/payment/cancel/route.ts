type PaymentReturnContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: PaymentReturnContext) {
  const { locale } = await context.params;
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(`/${locale}/credits`, requestUrl.origin);

  redirectUrl.searchParams.set("checkout", "cancelled");

  return Response.redirect(redirectUrl, 307);
}
