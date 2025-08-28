import SearchPage from "~/features/search/pages/search-page";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
  const domain = typeof window !== "undefined"
    ? window.location.origin
    : "https://social.mohammed-aydan.me";

  return [
    { title: "Search page" },
    { name: "description", content: "Search page description" },
    { name: "keywords", content: "search, find, social app" },
    { name: "author", content: "Social App Team" },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: "Search page" },
    { property: "og:description", content: "Search page description" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${domain}/search` },
    { property: "og:image", content: `${domain}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Search page" },
    { name: "twitter:description", content: "Search page description" },
    { name: "twitter:image", content: `${domain}/twitter-image.png` }
  ];
}

export default function Search() {
  return <SearchPage />;
}
