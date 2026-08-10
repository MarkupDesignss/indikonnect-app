import ProductDetail from "@/components/product/productDetail";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Required because output: "export"
export async function generateStaticParams() {
  try {
    const res = await fetch(
      "https://www.markupdesigns.net/indikonnect/api/products?per_page=1000&page=1",
      {
        cache: "force-cache",
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch products for static params");
      return [];
    }

    const result = await res.json();

    return (
      result?.data?.map((product: { slug: string }) => ({
        slug: product.slug,
      })) || []
    );
  } catch (error) {
    console.error("generateStaticParams error:", error);
    return [];
  }
}

export const dynamicParams = false;

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetail productSlug={slug} />;
}