"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src"> & { file: Blob };

export function ObjectUrlImage({ file, ...props }: Props) {
  const [preview, setPreview] = useState<{ file: Blob; url: string } | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (preview?.file !== file) return null;
  return <Image {...props} src={preview.url} unoptimized />;
}
