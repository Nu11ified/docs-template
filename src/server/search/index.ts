import FlexSearch from "flexsearch";

type SearchDoc = {
  slug: string;
  title: string;
  description: string;
  content: string;
};

const indices = new Map<string, FlexSearch.Index>();
const docs = new Map<string, SearchDoc[]>();

export async function loadSearchIndex(version: string) {
  if (indices.has(version)) return;

  const data: SearchDoc[] = await Bun.file(
    `.cache/search/${version}.json`,
  ).json();
  const index = new FlexSearch.Index({ tokenize: "forward" });

  data.forEach((doc, i) => {
    index.add(i, `${doc.title} ${doc.description} ${doc.content}`);
  });

  indices.set(version, index);
  docs.set(version, data);
}

export function search(version: string, query: string, limit = 10) {
  const index = indices.get(version);
  const allDocs = docs.get(version);
  if (!index || !allDocs) return [];

  const ids = index.search(query, limit) as number[];
  return ids.map((id) => ({
    slug: allDocs[id].slug,
    title: allDocs[id].title,
    description: allDocs[id].description,
  }));
}
