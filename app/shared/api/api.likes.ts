import { sdkGet, sdkPost, pageParams } from "~/sdk/endpoints";

export const likePost = (postId: string) => sdkPost("/api/Like", { postId });
export const getPostLikes = (postId: string, page = 1, limit = 20) => sdkGet(`/api/Like/${postId}`, pageParams(page, limit));
