const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";

/** SDK script tag for users to embed in their site's <head>. */
export const SDK_SNIPPET = `<script src="${API_URL}/sdk.js"></script>`;
