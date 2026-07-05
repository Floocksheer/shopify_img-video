import { isLive } from "@/lib/env";

/**
 * Upload a generated image into the store's media library (Files) via the
 * Shopify Admin GraphQL API: stagedUploadsCreate → upload → fileCreate.
 */
export async function exportImageToShopify(opts: {
  imageUrl: string;
  filename: string;
  altText?: string;
}): Promise<{ ok: true; mediaId: string }> {
  if (!isLive("shopify")) throw new Error("Shopify is not configured");

  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const endpoint = `https://${domain}/admin/api/2024-10/graphql.json`;

  const gql = async (query: string, variables: Record<string, unknown>) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(`Shopify API error: ${JSON.stringify(json.errors)}`);
    return json.data;
  };

  // fileCreate accepts an external URL directly — Shopify fetches it.
  const data = await gql(
    `mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id }
        userErrors { field message }
      }
    }`,
    {
      files: [
        {
          originalSource: opts.imageUrl,
          alt: opts.altText ?? opts.filename,
          contentType: "IMAGE",
        },
      ],
    },
  );

  const errors = data.fileCreate.userErrors;
  if (errors?.length) throw new Error(`Shopify rejected the file: ${errors[0].message}`);
  const id = data.fileCreate.files?.[0]?.id;
  if (!id) throw new Error("Shopify returned no file id");
  return { ok: true, mediaId: id };
}
