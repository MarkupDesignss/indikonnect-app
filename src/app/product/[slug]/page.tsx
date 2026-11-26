import ProductDetail from "@/features/products/components/productDetail";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const res = await fetch(
    "https://www.markupdesigns.net/indikonnect/api/products?per_page=1000&page=1",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: unknown = await res.json();
  const record = (value: unknown): Record<string, unknown> | undefined =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown> : undefined;
  const data = record(result)?.data;
  const nested = record(data)?.products;
  const products: unknown[] = Array.isArray(data) ? data : Array.isArray(nested) ? nested : [];
  return products.flatMap((product) => {
    const slug = record(product)?.slug;
    return typeof slug === "string" && slug.trim() ? [{ slug }] : [];
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <ProductDetail productSlug={slug} />;
}