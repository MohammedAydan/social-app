import { useContext } from "react";
import { FeedContext } from "../context/feed-context";

export const useFeed = () => useContext(FeedContext);