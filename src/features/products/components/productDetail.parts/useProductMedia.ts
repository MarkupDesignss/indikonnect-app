"use client";
import { useEffect, useState } from "react";

export function useProductMedia(gallery: string[]) {
const [isFullscreen, setIsFullscreen] = useState(false);

const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

const [isReviewViewerOpen, setIsReviewViewerOpen] = useState(false);

const [reviewViewerImages, setReviewViewerImages] = useState<string[]>([]);

const [reviewViewerIndex, setReviewViewerIndex] = useState(0);
  useEffect(() => {
    if (!isFullscreen && !isReviewViewerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [isFullscreen, isReviewViewerOpen]);

const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreen(true);
  };

const closeFullscreen = () => {
    setIsFullscreen(false);
  };

const nextFullscreenImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    setFullscreenImageIndex((prev) =>
      prev === gallery.length - 1 ? 0 : prev + 1,
    );
  };

const prevFullscreenImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    setFullscreenImageIndex((prev) =>
      prev === 0 ? gallery.length - 1 : prev - 1,
    );
  };

const openReviewViewer = (images: string[], index: number) => {
    if (!images.length) return;

    setReviewViewerImages(images);
    setReviewViewerIndex(index);
    setIsReviewViewerOpen(true);
  };

const closeReviewViewer = () => {
    setIsReviewViewerOpen(false);
  };

const nextReviewViewerImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (reviewViewerImages.length === 0) return;

    setReviewViewerIndex((prev) =>
      prev === reviewViewerImages.length - 1 ? 0 : prev + 1,
    );
  };

const prevReviewViewerImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (reviewViewerImages.length === 0) return;

    setReviewViewerIndex((prev) =>
      prev === 0 ? reviewViewerImages.length - 1 : prev - 1,
    );
  };

useEffect(() => {
    if (!isFullscreen && !isReviewViewerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === "Escape") setIsFullscreen(false);

        if (e.key === "ArrowLeft") {
          setFullscreenImageIndex((prev) =>
            prev === 0 ? gallery.length - 1 : prev - 1,
          );
        }

        if (e.key === "ArrowRight") {
          setFullscreenImageIndex((prev) =>
            prev === gallery.length - 1 ? 0 : prev + 1,
          );
        }

        return;
      }

      if (isReviewViewerOpen) {
        if (e.key === "Escape") setIsReviewViewerOpen(false);

        if (e.key === "ArrowLeft") {
          setReviewViewerIndex((prev) =>
            prev === 0 ? reviewViewerImages.length - 1 : prev - 1,
          );
        }

        if (e.key === "ArrowRight") {
          setReviewViewerIndex((prev) =>
            prev === reviewViewerImages.length - 1 ? 0 : prev + 1,
          );
        }
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [
    isFullscreen,
    isReviewViewerOpen,
    gallery.length,
    reviewViewerImages.length,
  ]);


return {
    isFullscreen,
    fullscreenImageIndex,
    setFullscreenImageIndex,
    openFullscreen,
    closeFullscreen,
    nextFullscreenImage,
    prevFullscreenImage,
    isReviewViewerOpen,
    reviewViewerImages,
    reviewViewerIndex,
    setReviewViewerIndex,
    openReviewViewer,
    closeReviewViewer,
    nextReviewViewerImage,
    prevReviewViewerImage,
  };
}
