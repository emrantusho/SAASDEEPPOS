export type GatewayType = "stripe" | "paypal" | "cash" | "webhook";

export interface PaymentSettings {
  version: string;
  updatedAt: string;
  currency: string;
  defaultGateway: GatewayType;
  methods: PaymentMethod[];
  webhookEndpoint: string | null;
}

export interface PaymentMethod {
  gateway: GatewayType;
  label: string;
  enabled: boolean;
  config: Record<string, string>;
}
