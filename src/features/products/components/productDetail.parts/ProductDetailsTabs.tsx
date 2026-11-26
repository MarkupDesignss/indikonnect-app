"use client";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { ProductDetailViewModel } from './useProductDetail';
import ProductDescriptionTab from './ProductDescriptionTab';
const ProductComboTab = dynamic(() => import('./ProductComboTab'));
const ProductReviewsTab = dynamic(() => import('./ProductReviewsTab'));

export default function ProductDetailsTabs({
  detailsSectionRef,
  contentTabs,
  setActiveTab,
  activeTab,
  comboItems,
  product,
  isCombo,
  specRows,
  router,
  comboTotals,
  showBAPricing,
  gallery,
  openFullscreen,
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
}: Pick<ProductDetailViewModel, 
  "detailsSectionRef"
  | "contentTabs"
  | "setActiveTab"
  | "activeTab"
  | "comboItems"
  | "product"
  | "isCombo"
  | "specRows"
  | "router"
  | "comboTotals"
  | "showBAPricing"
  | "gallery"
  | "openFullscreen"
  | "buildProductPath"
  | "currentUserId"
  | "getLoginPath"
  | "canReview"
  | "hasUserReviewed"
  | "handleReviewSubmit"
  | "reviewName"
  | "setReviewName"
  | "reviewEmail"
  | "setReviewEmail"
  | "setReviewRating"
  | "reviewRating"
  | "reviewTitle"
  | "setReviewTitle"
  | "handleReviewImageUpload"
  | "reviewImages"
  | "removeReviewImage"
  | "isSubmittingReview"
  | "reviewsList"
  | "openReviewViewer"
  | "reviewsSummary"
>) {
  return (
<section
          ref={detailsSectionRef}
          id="product-details-section"
          className="mt-7 scroll-mt-24 rounded-[8px] bg-white p-5 sm:p-6 lg:p-7"
        >
          <div className="flex items-center gap-7 overflow-x-auto border-b border-[#E7E7E7]">
            {contentTabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`relative whitespace-nowrap pb-3 text-[12px] font-semibold transition ${
                  activeTab === key
                    ? "text-[#111]"
                    : "text-[#999] hover:text-[#333]"
                }`}
              >
                {label}

                {key === "combo" && comboItems.length > 0 && (
                  <span className="ml-1 text-[9px]">
                    ({comboItems.length})
                  </span>
                )}

                {key === "reviews" && product.reviews > 0 && (
                  <span className="ml-1 text-[9px]">({product.reviews})</span>
                )}

                {activeTab === key && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#111]" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* DETAILS */}
            {activeTab === "details" && (
              <ProductDescriptionTab key="details" product={product} specRows={specRows} router={router} />
            )}

            {/* COMBO: WHAT'S INSIDE */}
            {activeTab === "combo" && isCombo && (
              <ProductComboTab
                key="combo"
                comboItems={comboItems}
                product={product}
                comboTotals={comboTotals}
                showBAPricing={showBAPricing}
                gallery={gallery}
                openFullscreen={openFullscreen}
                buildProductPath={buildProductPath}
              />
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <ProductReviewsTab
                key="reviews"
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
                product={product}
                reviewsSummary={reviewsSummary}
              />
            )}
          </AnimatePresence>
        </section>
  );
}
