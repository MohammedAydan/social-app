import { useContext } from "react";
import { CommentsContext } from "../context/comments-context";

export const useComments = () => useContext(CommentsContext);