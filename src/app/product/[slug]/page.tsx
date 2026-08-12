import ProductDetail from "@/components/product/productDetail";

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

  const result = await res.json();

  const products = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result?.data?.products)
      ? result.data.products
      : [];

  return products
    .filter((product: any) => product?.slug)
    .map((product: any) => ({
      slug: String(product.slug),
    }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <ProductDetail productSlug={slug} />;
}