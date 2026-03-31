// No-op PnP manifest to override the stale ~/.pnp.cjs
// This disables Yarn PnP resolution for this project (uses node_modules instead)
module.exports = { setup: () => {} };
