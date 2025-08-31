import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET({ site }) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const siteWithBase = site ? new URL("/app/", site) : new URL("http://localhost:3001/app/");
  return rss({
    title: "Blog",
    description: "Latest posts",
    site: siteWithBase,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
      link: `blog/${p.slug}`,
    })),
  });
}

