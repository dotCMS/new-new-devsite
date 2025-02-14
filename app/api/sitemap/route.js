import { getSideNav } from "@/services/docs/getSideNav";
import { Config } from "@/util/config";
import { getBlogListing } from "@/services/blog/getBlogListing";
import { getDevResources } from "@/services/learning/getDevResources";
const extractHrefs = (obj) => {
  const baseURL = `${Config.CDNHost}/docs/`;
  let hrefs = [];

  if (obj && typeof obj === "object") {
    if (obj?.urlTitle) {
      const href = `${baseURL}${obj?.urlTitle}`;
      hrefs.push({ href, modDate: obj?.modDate });
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          for (const item of value) {
            hrefs = hrefs.concat(extractHrefs(item));
          }
        } else if (typeof value === "object") {
          hrefs = hrefs.concat(extractHrefs(value));
        }
      }
    }
  }

  return hrefs;
};

const getBlogs = async () => {
  var finalBlogs = [];

  const { blogs, pagination } = await getBlogListing({
    tagFilter: "",
    page: 1,
    pageSize: 50,
  });
  blogs.map((blog) => {
    finalBlogs.push({
      href: `${Config.CDNHost}/blog/${blog.urlTitle}`,
      modDate: blog.modDate,
    });
  });
  for (var j = 2; j <= pagination.totalPages; j++) {
    const { blogs } = await getBlogListing({
      tagFilter: "",
      page: j,
      pageSize: 50,
    });
    if (blogs.length == 0) {
      break;
    }
    blogs.map((blog) => {
      finalBlogs.push({
        href: `${Config.CDNHost}/blog/${blog.urlTitle}`,
        modDate: blog.modDate,
      });
    });
  }

  return finalBlogs;
};

const loadDevResources = async () => {
  var finalDevResources = [];

  const { devResources, pagination } = await getDevResources({
    page: 1,
    pageSize: 50,
  });
  devResources.map((devResource) => {
    finalDevResources.push({
      href: `${Config.CDNHost}/learning/${devResource.slug}`,
      modDate: devResource.modDate,
    });
  });
  for (var j = 2; j <= pagination.totalPages; j++) {
    const { devResources } = await getDevResources({
      page: j,
      pageSize: 50,
    });
    if (devResources.length == 0) {
      break;
    }
    devResources.map((blog) => {
      finalDevResources.push({
        href: `${Config.CDNHost}/learning/${blog.slug}`,
        modDate: blog.modDate,
      });
    });
  }

  return finalDevResources;
};

const createSitemap = (links, blogs, devResources) => {
  const urls = (links || [])
    .map(
      ({ href, modDate }) => `
    <url>
      <loc>${href}</loc>
      <lastmod>${
        modDate
          ? new Date(modDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      }</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `
    )
    .join("");

  const blogLinks = (blogs || [])
    .map(
      ({ href, modDate }) => `
    <url>
      <loc>${href}</loc>
      <lastmod>${
        modDate
          ? new Date(modDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      }</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `
    )
    .join("");

  const devResourceLinks = (devResources || [])
    .map(
      ({ href, modDate }) => `
        <url>
      <loc>${href}</loc>
      <lastmod>${
        modDate
          ? new Date(modDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      }</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${devResourceLinks}
    ${blogLinks}
    ${urls}
    
  </urlset>`;
};

export async function GET() {
  try {

    console.log("Config.CDNHost", Config.CDNHost);
    const docs = await getSideNav();
    const blogs = await getBlogs();
    const devResources = await loadDevResources();
    if (!docs || typeof docs !== "object") {
      throw new Error("Invalid docs format returned from getCoreNavLeft()");
    }

    const links = extractHrefs(docs);
    const sitemap = createSitemap(links, blogs, devResources);

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      JSON.stringify({ message: "Failed to generate sitemap", error }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
