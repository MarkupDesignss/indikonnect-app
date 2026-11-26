"use client";
import Link from "next/link";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";
import Loding from "@/components/common/Loding";
import {
  ProductDetailProps,
  parseJsonObject,
} from "@/features/products/components/productDetail.parts/support";
import { poppins } from "./productDetail.parts/font";
import { useProductDetail } from "./productDetail.parts/useProductDetail";
import ProductBreadcrumb from "./productDetail.parts/ProductBreadcrumb";
import ProductGallery from "./productDetail.parts/ProductGallery";
import ProductPurchasePanel from "./productDetail.parts/ProductPurchasePanel";
import ProductDetailsTabs from "./productDetail.parts/ProductDetailsTabs";
import RelatedProducts from "./productDetail.parts/RelatedProducts";
import ProductFullscreen from "./productDetail.parts/ProductFullscreen";
import ReviewImageViewer from "./productDetail.parts/ReviewImageViewer";
import ManufacturingInfoModal from "./productDetail.parts/ManufacturingInfoModal";
import ProductThumbnailsModal from "./productDetail.parts/ProductThumbnailsModal";
import RelatedProductsDrawer from "./productDetail.parts/RelatedProductsDrawer";
import ProductAnimations from "./productDetail.parts/ProductAnimations";

export default function ProductDetail({ productSlug }: ProductDetailProps) {
  const {
    product,
    gallery,
    MAX_VISIBLE_THUMBS,
    setShowAllThumbnails,
    setActiveImage,
    activeImage,
    mainImageBoxRef,
    openFullscreen,
    selectedVariantId,
    isCombo,
    comboItems,
    handleWishlistToggle,
    isWishlistLoading,
    isWishlisted,
    setShowRelatedSheet,
    isDistributorApp,
    userAccountType,
    quantity,
    handleReadMore,
    handleViewComboDetails,
    handleSelectComboImage,
    comboTotals,
    hasVariants,
    variantAttributeOptions,
    selectedVariantAttributes,
    handleAttributeSelect,
    displayVariants,
    isMainProductSelected,
    handleSelectVariant,
    selectedVariant,
    mainPurchaseAvailable,
    handleBuyNow,
    isBuyingNow,
    handleAddToCart,
    isAddedToCart,
    handleNotifySubmit,
    isNotifyLoading,
    activeProductSlug,
    apiProduct,
    manufacturingInfo,
    setShowManufacturingInfo,
    detailsSectionRef,
    setActiveTab,
    activeTab,
    router,
    buildProductPath,
    currentUserId,
    getLoginPath,
    canReview,
    hasUserReviewed,
    handleReviewSubmit,
    reviewName,
    setReviewName,
    reviewEmail,
    setReviewEmail,
    setReviewRating,
    reviewRating,
    reviewTitle,
    setReviewTitle,
    handleReviewImageUpload,
    reviewImages,
    removeReviewImage,
    isSubmittingReview,
    reviewsList,
    openReviewViewer,
    reviewsSummary,
    similarProducts,
    relatedSortOption,
    setRelatedSortOption,
    visibleSimilarProducts,
    toggleWishlist,
    wishlistState,
    relatedBusyId,
    addRelatedToCart,
    isFullscreen,
    closeFullscreen,
    fullscreenImageIndex,
    prevFullscreenImage,
    nextFullscreenImage,
    setFullscreenImageIndex,
    isReviewViewerOpen,
    reviewViewerImages,
    closeReviewViewer,
    reviewViewerIndex,
    prevReviewViewerImage,
    nextReviewViewerImage,
    setReviewViewerIndex,
    showManufacturingInfo,
    showAllThumbnails,
    showRelatedSheet,
    sortedSimilarProducts,
    isProductLoading,
  } = useProductDetail({ productSlug });
  if (isProductLoading && !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loding width={200} height={200} />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="max-w-md px-4 text-center">
          <div className="mb-4 text-6xl">🔍</div>

          <h2 className="mb-3 text-2xl font-bold">Product Not Found</h2>

          <p className="mb-6 text-sm text-[#777]">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full border px-5 py-2.5 text-sm font-semibold"
            >
              Go Back
            </button>

            <Link
              href="/products"
              className="rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  const specification = parseJsonObject(product.specification);

  const specRows =
    Object.keys(specification).length > 0
      ? Object.entries(specification).map(([key, value]) => [
          key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
          String(value),
        ])
      : [
          ["Product Type", product.category],
          ["Product Code", product.productCode || "N/A"],
          ["Availability", product.inStock ? "In Stock" : "Out of Stock"],
          ["Stock Quantity", product.stockQuantity],
          ["UOM", apiProduct?.uom || "NOS"],
          ["HSN Code", apiProduct?.hsn_code || "N/A"],
          ["Warranty", "1 Year"],
          ["Return Policy", "7 Days"],
        ];

  const contentTabs: [string, string][] = [
    ["details", "Details"],
    ...(isCombo ? ([["combo", "What's Inside"]] as [string, string][]) : []),
    ["reviews", "Reviews"],
  ];

  const showBAPricing = isDistributorApp && userAccountType === "distributor";
  return (
    <div
      className={`${poppins.className} min-h-screen bg-[#F5F5F5] text-[#171717]`}
    >
      <Header />

      <main className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-4 lg:px-7 xl:px-10">
        {/* BREADCRUMB */}
        <ProductBreadcrumb product={product} />

        {/* HERO */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.92fr_1.08fr] xl:gap-5">
          {/* IMAGE AREA */}
          <ProductGallery
            gallery={gallery}
            MAX_VISIBLE_THUMBS={MAX_VISIBLE_THUMBS}
            setShowAllThumbnails={setShowAllThumbnails}
            setActiveImage={setActiveImage}
            activeImage={activeImage}
            product={product}
            mainImageBoxRef={mainImageBoxRef}
            openFullscreen={openFullscreen}
            selectedVariantId={selectedVariantId}
            isCombo={isCombo}
            comboItems={comboItems}
            handleWishlistToggle={handleWishlistToggle}
            isWishlistLoading={isWishlistLoading}
            isWishlisted={isWishlisted}
            setShowRelatedSheet={setShowRelatedSheet}
          />

          {/* PRODUCT DETAILS */}
          <ProductPurchasePanel
            product={product}
            isCombo={isCombo}
            isDistributorApp={isDistributorApp}
            userAccountType={userAccountType}
            quantity={quantity}
            handleReadMore={handleReadMore}
            comboItems={comboItems}
            handleViewComboDetails={handleViewComboDetails}
            handleSelectComboImage={handleSelectComboImage}
            showBAPricing={showBAPricing}
            comboTotals={comboTotals}
            hasVariants={hasVariants}
            variantAttributeOptions={variantAttributeOptions}
            selectedVariantAttributes={selectedVariantAttributes}
            handleAttributeSelect={handleAttributeSelect}
            displayVariants={displayVariants}
            isMainProductSelected={isMainProductSelected}
            selectedVariantId={selectedVariantId}
            handleSelectVariant={handleSelectVariant}
            selectedVariant={selectedVariant}
            mainPurchaseAvailable={mainPurchaseAvailable}
            handleBuyNow={handleBuyNow}
            isBuyingNow={isBuyingNow}
            handleAddToCart={handleAddToCart}
            isAddedToCart={isAddedToCart}
            handleNotifySubmit={handleNotifySubmit}
            isNotifyLoading={isNotifyLoading}
            handleWishlistToggle={handleWishlistToggle}
            isWishlisted={isWishlisted}
            activeProductSlug={activeProductSlug}
            apiProduct={apiProduct}
            manufacturingInfo={manufacturingInfo}
            setShowManufacturingInfo={setShowManufacturingInfo}
          />
        </div>

        {/* CONTENT TABS */}
        <ProductDetailsTabs
          detailsSectionRef={detailsSectionRef}
          contentTabs={contentTabs}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          comboItems={comboItems}
          product={product}
          isCombo={isCombo}
          specRows={specRows}
          router={router}
          comboTotals={comboTotals}
          showBAPricing={showBAPricing}
          gallery={gallery}
          openFullscreen={openFullscreen}
          buildProductPath={buildProductPath}
          currentUserId={currentUserId}
          getLoginPath={getLoginPath}
          canReview={canReview}
          hasUserReviewed={hasUserReviewed}
          handleReviewSubmit={handleReviewSubmit}
          reviewName={reviewName}
          setReviewName={setReviewName}
          reviewEmail={reviewEmail}
          setReviewEmail={setReviewEmail}
          setReviewRating={setReviewRating}
          reviewRating={reviewRating}
          reviewTitle={reviewTitle}
          setReviewTitle={setReviewTitle}
          handleReviewImageUpload={handleReviewImageUpload}
          reviewImages={reviewImages}
          removeReviewImage={removeReviewImage}
          isSubmittingReview={isSubmittingReview}
          reviewsList={reviewsList}
          openReviewViewer={openReviewViewer}
          reviewsSummary={reviewsSummary}
        />

        {/* RELATED PRODUCTS */}
        <RelatedProducts
          similarProducts={similarProducts}
          router={router}
          relatedSortOption={relatedSortOption}
          setRelatedSortOption={setRelatedSortOption}
          visibleSimilarProducts={visibleSimilarProducts}
          buildProductPath={buildProductPath}
          setShowRelatedSheet={setShowRelatedSheet}
          toggleWishlist={toggleWishlist}
          wishlistState={wishlistState}
          isDistributorApp={isDistributorApp}
          userAccountType={userAccountType}
          relatedBusyId={relatedBusyId}
          addRelatedToCart={addRelatedToCart}
        />
      </main>

      {/* FULLSCREEN PRODUCT */}
      <ProductFullscreen
        isFullscreen={isFullscreen}
        gallery={gallery}
        closeFullscreen={closeFullscreen}
        fullscreenImageIndex={fullscreenImageIndex}
        product={product}
        prevFullscreenImage={prevFullscreenImage}
        nextFullscreenImage={nextFullscreenImage}
        setFullscreenImageIndex={setFullscreenImageIndex}
      />

      {/* REVIEW IMAGE VIEWER */}
      <ReviewImageViewer
        isReviewViewerOpen={isReviewViewerOpen}
        reviewViewerImages={reviewViewerImages}
        closeReviewViewer={closeReviewViewer}
        reviewViewerIndex={reviewViewerIndex}
        prevReviewViewerImage={prevReviewViewerImage}
        nextReviewViewerImage={nextReviewViewerImage}
        setReviewViewerIndex={setReviewViewerIndex}
      />

      {/* MANUFACTURING INFO */}
      <ManufacturingInfoModal
        showManufacturingInfo={showManufacturingInfo}
        setShowManufacturingInfo={setShowManufacturingInfo}
        manufacturingInfo={manufacturingInfo}
      />

      {/* SEE ALL THUMBNAILS MODAL */}
      <ProductThumbnailsModal
        showAllThumbnails={showAllThumbnails}
        setShowAllThumbnails={setShowAllThumbnails}
        gallery={gallery}
        setActiveImage={setActiveImage}
        activeImage={activeImage}
        product={product}
      />

      {/* RELATED PRODUCTS DRAWER */}
      <RelatedProductsDrawer
        showRelatedSheet={showRelatedSheet}
        setShowRelatedSheet={setShowRelatedSheet}
        sortedSimilarProducts={sortedSimilarProducts}
        relatedSortOption={relatedSortOption}
        setRelatedSortOption={setRelatedSortOption}
        buildProductPath={buildProductPath}
        toggleWishlist={toggleWishlist}
        wishlistState={wishlistState}
        isDistributorApp={isDistributorApp}
        userAccountType={userAccountType}
        relatedBusyId={relatedBusyId}
        addRelatedToCart={addRelatedToCart}
      />

      {/* FOOTER */}
      <Footer />

      {/* GLOBAL ANIMATIONS */}
      <ProductAnimations />
    </div>
  );
}
