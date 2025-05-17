import type { Route } from "./+types/home";
import SearchPage from "~/features/search/pages/search-page";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Search page" },
    { name: "description", content: "Search page description" },
  ];
}

export default function Search() {
  return <SearchPage />;
}
