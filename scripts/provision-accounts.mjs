const target = process.argv[2];
if (!["preview", "production"].includes(target))
  throw new Error("Choose preview or production.");
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !token)
  throw new Error("Cloudflare account ID and API token are required.");
const name = `settledsolo-accounts-${target}`;
const base = `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
const listing = await fetch(`${base}?name=${encodeURIComponent(name)}`, {
  headers,
});
const list = await listing.json();
if (!listing.ok || !list.success)
  throw new Error("Could not list account databases; check D1 permissions.");
let database = list.result.find((db) => db.name === name);
if (!database) {
  const response = await fetch(base, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error("Could not create account database; check D1 permissions.");
  database = result.result;
}
console.log(`${name}: ${database.uuid}`);
