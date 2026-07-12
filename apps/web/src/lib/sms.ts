export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || "SAASDEEP";
const SMS_PROVIDER = process.env.SMS_PROVIDER || "console";

export class ElasticSmsProvider implements SmsProvider {
  async send(phone: string, message: string) {
    if (!SMS_API_KEY) {
      console.warn("SMS_API_KEY not configured, falling back to console");
      await new ConsoleSmsProvider().send(phone, message);
      return;
    }

    const url = "https://api.elasticemail.com/v4/sms/send";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ElasticEmail-ApiKey": SMS_API_KEY,
      },
      body: JSON.stringify({
        recipients: [{ to: phone }],
        content: {
          body: message,
          from: SMS_SENDER_ID,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Elastic SMS error:", err);
    }
  }
}

export class ConsoleSmsProvider implements SmsProvider {
  async send(phone: string, message: string) {
    console.log(`[SMS to ${phone}]: ${message}`);
  }
}

export function getSmsProvider(): SmsProvider {
  if (SMS_API_KEY && SMS_PROVIDER === "elastic") {
    return new ElasticSmsProvider();
  }
  return new ConsoleSmsProvider();
}
