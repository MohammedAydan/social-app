import { Repeat2 } from "lucide-react";
import PostHeader from './post-header';
import PostContent from './post-content';
import type { PostType } from '~/shared/types/post-types';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { cn } from "~/lib/utils";

/**
 * Nested share (quote) card. Uses a plain div + navigate (not a wrapping
 * <Link>) so inner markdown links don't nest <a> inside <a>. Depth is
 * unbounded — the backend eager-loads 3 ancestor levels and this recurses
 * beyond that. Deeper levels get progressively flatter styling.
 */
const SharingPostCard = ({ post, depth = 0 }: { post: PostType; depth?: number }) => {
  const navigate = useNavigate();

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/post/${post?.id}`)}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(`/post/${post?.id}`); }}
      className="w-full my-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
    >
      <Card className={cn(
        'w-full shadow-xs border-l-2 border-l-primary/40 bg-muted/[0.25] gap-0 py-4',
        depth > 0 && 'shadow-none bg-muted/[0.15]'
      )}>
        <CardHeader className="pb-2" onClick={(e) => e.stopPropagation()}>
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Repeat2 className="h-3.5 w-3.5" />
            Quoted post
          </p>
          <PostHeader post={post} />
        </CardHeader>

        <CardContent className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <PostContent post={post} />
          {(post.parentPostId != null && post.parentPost != null) && (
            <SharingPostCard post={post.parentPost} depth={depth + 1} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SharingPostCard;
