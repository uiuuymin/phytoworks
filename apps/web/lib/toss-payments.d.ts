declare global {
  type TossPaymentAmount = {
    currency: "KRW";
    value: number;
  };

  type TossPaymentWidget = {
    destroy(): void;
  };

  type TossPaymentWidgets = {
    setAmount(amount: TossPaymentAmount): Promise<void>;
    renderPaymentMethods(params: {
      selector: string;
      variantKey?: string;
    }): Promise<TossPaymentWidget>;
    renderAgreement(params: { selector: string }): Promise<TossPaymentWidget>;
    requestPayment(params: {
      orderId: string;
      orderName: string;
      successUrl: string;
      failUrl: string;
    }): Promise<void>;
  };

  type TossPaymentsInstance = {
    widgets(params: { customerKey: "ANONYMOUS" }): TossPaymentWidgets;
  };

  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

export {};
