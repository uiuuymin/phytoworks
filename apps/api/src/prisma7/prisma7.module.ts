import { Global, Module } from "@nestjs/common";
import { Prisma7Service } from "./prisma7.service.js";

@Global()
@Module({
  providers: [Prisma7Service],
  exports: [Prisma7Service],
})
export class Prisma7Module {}
