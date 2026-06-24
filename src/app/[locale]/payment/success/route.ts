import { paymentReturnBridgeResponse } from "@/lib/payment-return-bridge";
import { getPublicRequestOrigin } from "@/lib/public-origin";

type PaymentReturnContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: PaymentReturnContext) {
  const { locale } = await context.params;
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL(`/${locale}/credits`, getPublicRequestOrigin(request));
  const sessionId = requestUrl.searchParams.get("session_id");

  redirectUrl.searchParams.set("checkout", "success");
  if (sessionId) redirectUrl.searchParams.set("session_id", sessionId);

  return paymentReturnBridgeResponse(redirectUrl);
}
