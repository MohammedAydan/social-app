import { serverApi } from "@/services/api/server";
import type { ApiResponse } from "@/services/api/types";
import type { CreatePostType } from "~/shared/types/create-post-type";
import type { PostType } from "~/shared/types/post-types";
import type { SharePostRequest } from "~/shared/types/share-post-type";
import type { UpdatePostRequest } from "~/shared/types/update-post-type";

export const postsService = {
  create: (payload: CreatePostType) => serverApi.post<ApiResponse<PostType>>("/api/Posts", payload),
  update: (payload: UpdatePostRequest) => serverApi.put<ApiResponse<PostType>>("/api/Posts", payload),
  getById: (id: string) => serverApi.get<ApiResponse<PostType>>(`/api/Posts/${id}`),
  remove: (id: string) => serverApi.delete<ApiResponse<null>>(`/api/Posts/${id}`),
  getFeed: (page = 1, limit = 20) => serverApi.get<ApiResponse<PostType[]>>("/api/Posts/feed", { query: { Page: page, Limit: limit } }),
  getMine: (page = 1, limit = 20) => serverApi.get<ApiResponse<PostType[]>>("/api/Posts/my-posts", { query: { Page: page, Limit: limit } }),
  getByUser: (userId: string, page = 1, limit = 20) => serverApi.get<ApiResponse<PostType[]>>(`/api/Posts/user/${userId}`, { query: { Page: page, Limit: limit } }),
  share: (payload: SharePostRequest) => serverApi.post<ApiResponse<PostType>>("/api/Posts/share", payload),
};
