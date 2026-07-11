import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "./router";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Saasdeep Softwares API",
  description: "Saasdeep Softwares - Point of Sale system API — products, customers, orders, transactions, and payment methods.",
  version: "0.4.1",
  baseUrl: "/api",
  tags: ["Products", "Customers", "Orders", "Transactions", "Payment Methods", "Dashboard"],
});
