"use client";

import "@/components/common/premium-header.css";
import { Suspense } from "react";


import { HeaderSkeleton } from "@/components/common/Header.parts/support";
import { HeaderInner } from "@/components/common/Header.parts/HeaderInner";


export default function Header(props: {
  hideAnnouncement?: boolean;
  hideMenu?: boolean;
  showSidebarMenu?: boolean;
  onSidebarMenuClick?: () => void;
}) {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderInner
        hideAnnouncement={props.hideAnnouncement}
        hideMenu={props.hideMenu}
      />
    </Suspense>
  );
}
