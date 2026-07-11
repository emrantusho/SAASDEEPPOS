import Link from "next/link";

const pages: Record<string, { title: string; content: string }> = {
  about: {
    title: "About Us",
    content: "Welcome to our store. We offer quality products at competitive prices. This store is powered by Saasdeep Softwares - an open-source Point of Sale system.",
  },
  contact: {
    title: "Contact Us",
    content: "For support or inquiries, please contact your store administrator or reach out to Saasdeep Softwares.",
  },
  privacy: {
    title: "Privacy Policy",
    content: "This store respects your privacy. Any information collected is used solely for order processing and will not be shared with third parties.",
  },
  terms: {
    title: "Terms of Service",
    content: "By using this store, you agree to these terms. All transactions are subject to availability and confirmation.",
  },
};

export default async function PagePage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageData = pages[page];

  if (!pageData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
        <Link href="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-6">{pageData.title}</h1>
      <p className="text-muted-foreground leading-relaxed">{pageData.content}</p>
    </div>
  );
}
