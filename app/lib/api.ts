import { postsApi } from "~/sdk/endpoints";

export const createPost = <T>(body: unknown) => postsApi.create<T>(body);
