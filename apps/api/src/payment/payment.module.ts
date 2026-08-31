import { Module } from "@nestjs/common";
import { Prisma7Module } from "../prisma7/prisma7.module.js";
import { InMemoryPaymentRepository } from "./in-memory-payment.repository.js";
import { PaymentController } from "./payment.controller.js";
import { PAYMENT_GATEWAY, TossPaymentsGateway } from "./payment.gateway.js";
import { PAYMENT_REPOSITORY } from "./payment.repository.js";
import { PaymentService } from "./payment.service.js";
import { PrismaPaymentRepository } from "./prisma-payment.repository.js";

@Module({
  imports: [Prisma7Module],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    InMemoryPaymentRepository,
    PrismaPaymentRepository,
    TossPaymentsGateway,
    {
      provide: PAYMENT_REPOSITORY,
      useExisting: PrismaPaymentRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useExisting: TossPaymentsGateway,
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
