import ProductDetail from "../../../components/product/productDetail";

// Generate static params for all products
export async function generateStaticParams() {
    const productIds = [1, 2, 3, 4, 5, 6];
    return productIds.map((id) => ({
        id: id.toString(),
    }));
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return <ProductDetail productId={id} />;
}