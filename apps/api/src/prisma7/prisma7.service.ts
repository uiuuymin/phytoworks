import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

@Injectable()
export class Prisma7Service implements OnModuleDestroy {
  private prismaClient: PrismaClient | undefined;

  get client(): PrismaClient {
    if (!this.prismaClient) {
      this.prismaClient = this.createClient();
    }

    return this.prismaClient;
  }

  private createClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required for Prisma7Service.");
    }

    return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prismaClient?.$disconnect();
  }
}
