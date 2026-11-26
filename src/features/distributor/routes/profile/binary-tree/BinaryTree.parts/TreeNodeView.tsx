"use client";

import { EmptyBranch, GenealogyTreeNode, LINE, TreeSide } from "@/features/distributor/routes/profile/binary-tree/BinaryTree.parts/support";
import { MemberNodeCard } from "@/features/distributor/routes/profile/binary-tree/BinaryTree.parts/MemberNodeCard";


// --------------------------------------------------
// RECURSIVE TREE NODE
// --------------------------------------------------

export function TreeNodeView({
  node,
  side,
  collapsed,
  inverted,
  onOpenBranch,
}: {
  node: GenealogyTreeNode;
  side: TreeSide;
  collapsed: boolean;
  inverted: boolean;
  onOpenBranch: (baId: string) => void;
}) {
  const hasChildren = Boolean(node.left || node.right);

  const visualBranches: Array<{
    node: GenealogyTreeNode | null;
    side: TreeSide;
  }> = [
    { node: node.left, side: "left" },
    { node: node.right, side: "right" },
  ];

  return (
    <div className="flex shrink-0 flex-col items-center">
      <MemberNodeCard
        member={node.member}
        side={side}
        inverted={inverted}
        onOpenBranch={onOpenBranch}
      />

      {!collapsed && hasChildren && (
        <>
          <div
            className="h-8 w-px"
            style={{ backgroundColor: LINE }}
          />

          <div className="flex items-start justify-center">
            <div className="relative flex flex-col items-center px-4 pt-8 sm:px-5">
              <div
                className="absolute left-1/2 right-0 top-0 h-px"
                style={{ backgroundColor: LINE }}
              />

              <div
                className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2"
                style={{ backgroundColor: LINE }}
              />

              {visualBranches[0].node ? (
                <TreeNodeView
                  node={visualBranches[0].node}
                  side={visualBranches[0].side}
                  collapsed={collapsed}
                  inverted={inverted}
                  onOpenBranch={onOpenBranch}
                />
              ) : (
                <EmptyBranch
                  side={visualBranches[0].side}
                  inverted={inverted}
                />
              )}
            </div>

            <div className="relative flex flex-col items-center px-4 pt-8 sm:px-5">
              <div
                className="absolute left-0 right-1/2 top-0 h-px"
                style={{ backgroundColor: LINE }}
              />

              <div
                className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2"
                style={{ backgroundColor: LINE }}
              />

              {visualBranches[1].node ? (
                <TreeNodeView
                  node={visualBranches[1].node}
                  side={visualBranches[1].side}
                  collapsed={collapsed}
                  inverted={inverted}
                  onOpenBranch={onOpenBranch}
                />
              ) : (
                <EmptyBranch
                  side={visualBranches[1].side}
                  inverted={inverted}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
