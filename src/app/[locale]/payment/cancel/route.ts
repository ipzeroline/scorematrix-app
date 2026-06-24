import { paymentReturnBridgeResponse } from "@/lib/payment-return-bridge";
import { getPublicRequestOrigin } from "@/lib/public-origin";

type PaymentReturnContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(request: Request, context: PaymentReturnContext) {
  const { locale } = await context.params;
  const redirectUrl = new URL(`/${locale}/credits`, getPublicRequestOrigin(request));

  redirectUrl.searchParams.set("checkout", "cancelled");

  return paymentReturnBridgeResponse(redirectUrl);
}
