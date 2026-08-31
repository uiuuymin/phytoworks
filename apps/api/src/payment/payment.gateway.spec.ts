import { afterEach, describe, expect, it, vi } from "vitest";
import { TossPaymentsGateway } from "./payment.gateway.js";

describe("TossPaymentsGateway", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("confirms through Toss with a Basic secret-key credential", async () => {
    vi.stubEnv("TOSS_SECRET_KEY", "test_sk_payment");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          paymentKey: "payment-key-1",
          orderId: "order-payment-test",
          totalAmount: 5_000_000,
          status: "DONE",
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      new TossPaymentsGateway().confirm({
        paymentKey: "payment-key-1",
        orderId: "order-payment-test",
        amount: 5_000_000,
      }),
    ).resolves.toEqual({
      paymentKey: "payment-key-1",
      orderId: "order-payment-test",
      totalAmount: 5_000_000,
      status: "DONE",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.tosspayments.com/v1/payments/confirm",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from("test_sk_payment:").toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey: "payment-key-1",
          orderId: "order-payment-test",
          amount: 5_000_000,
        }),
      }),
    );
  });

  it("requires the server-side secret key", async () => {
    vi.stubEnv("TOSS_SECRET_KEY", "");

    await expect(
      new TossPaymentsGateway().confirm({
        paymentKey: "payment-key-1",
        orderId: "order-payment-test",
        amount: 5_000_000,
      }),
    ).rejects.toMatchObject({ code: "MISSING_SECRET_KEY" });
  });
});
