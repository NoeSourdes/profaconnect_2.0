"use client";

import {
  CommentProvider,
  useCommentById,
  useCommentItemContentState,
} from "@udecode/plate-comments";
import { formatDistance } from "date-fns";

import { fr } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { CommentAvatar } from "./comment-avatar";
import { CommentMoreDropdown } from "./comment-more-dropdown";
import { CommentResolveButton } from "./comment-resolve-button";
import { CommentValue } from "./comment-value";

type PlateCommentProps = {
  commentId: string;
};

function CommentItemContent() {
  const {
    comment,
    commentText,
    editingValue,
    isMyComment,
    isReplyComment,
    user,
  } = useCommentItemContentState();
  const userData = useSession();

  return (
    <div>
      <div className="relative flex items-center gap-2">
        <CommentAvatar userId={comment.userId} />

        <h4 className="text-sm font-semibold leading-none">
          {userData.data?.user?.name?.split(" ")[0] ?? ""}
        </h4>

        <div className="text-xs leading-none text-muted-foreground">
          il y a {formatDistance(comment.createdAt, Date.now(), { locale: fr })}
        </div>

        {isMyComment && (
          <div className="absolute -right-0.5 -top-0.5 flex space-x-1">
            {isReplyComment ? null : <CommentResolveButton />}

            <CommentMoreDropdown />
          </div>
        )}
      </div>

      <div className="mb-4 pl-7 pt-0.5">
        {editingValue ? (
          <CommentValue />
        ) : (
          <div className="whitespace-pre-wrap text-sm">{commentText}</div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId }: PlateCommentProps) {
  const comment = useCommentById(commentId);

  if (!comment) return null;

  return (
    <CommentProvider id={commentId} key={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
