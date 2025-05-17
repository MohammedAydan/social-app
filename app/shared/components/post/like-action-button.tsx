import React from "react";
import { Heart } from "lucide-react";
import ActionButton from "./action-button";
import { usePost } from "~/features/feed/hooks/use-post";

const LikeActionButton = () => {
  const { post, toggleLike } = usePost();
  
  return (
    <ActionButton
      onClick={() => toggleLike()}
      icon={
        post?.isLiked ? (
          <Heart fill="currentColor" strokeWidth={0} className="text-primary" />
        ) : (
          <Heart strokeWidth={2.5} className="text-primary" />
        )
      }
      aria-label={post?.isLiked ? "Unlike post" : "Like post"}
      text={`(${post?.likesCount})`}
    />
  );
};

export default LikeActionButton;
