import { useContext } from "react";
import { PostContext } from "../context/post-context";

export const usePost = () => useContext(PostContext);