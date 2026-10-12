const OWNER = "secondpandaonthemoon-sudovat";
const REPO = "energy";
const REF = "main";
const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}`;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const dbHeaders = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };

async function fetchText(path: string) {
  const res = await fetch(`${RAW}/${path}`, { headers: { "User-Agent": "ASAY-Energy-Preview" } });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return await res.text();
}

async function loadDivisions() {
  const [dRes, pRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/energy_divisions?select=*&active=eq.true&order=sort_order.asc`, { headers: dbHeaders }),
    fetch(`${SUPABASE_URL}/rest/v1/energy_products?select=*&active=eq.true&order=division_id.asc,sort_order.asc`, { headers: dbHeaders }),
  ]);
  if (!dRes.ok || !pRes.ok) throw new Error(`Supabase catalog read failed: ${dRes.status}/${pRes.status}`);
  const divisions = await dRes.json();
  const products = await pRes.json();
  return divisions.map((d: any) => ({
    id: d.id,
    name: d.name,
    shortName: d.short_name,
    tagline: d.tagline,
    description: d.description,
    products: products.filter((p: any) => p.division_id === d.id).map((p: any) => ({
      id: p.id,
      name: p.name,
      series: p.series,
      standbyPower: p.standby_power,
      primePower: p.prime_power,
      engine: p.engine,
      alternator: p.alternator,
      fuelCapacity: p.fuel_capacity,
      noiseLevel: p.noise_level,
      dimensions: p.dimensions,
      weight: p.weight,
      image: p.image_url,
      description: p.description,
      features: p.features || [],
    })),
  }));
}

function replaceDivisions(js: string, divisions: any[]) {
  const keyPos = js.indexOf("divisions:");
  if (keyPos < 0) return js;
  let i = keyPos + "divisions:".length;
  while (i < js.length && /\s/.test(js[i])) i++;
  if (js[i] !== "[") return js;
  const arrStart = i;
  let depth = 0, quote = "", escape = false;
  for (; i < js.length; i++) {
    const ch = js[i];
    if (quote) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return js.slice(0, arrStart) + JSON.stringify(divisions) + js.slice(i + 1);
    }
  }
  return js;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const base = `${url.origin}/functions/v1/asay-energy-preview`;
    const asset = url.searchParams.get("asset");

    if (asset) {
      let body = await fetchText(asset);
      let contentType = "text/plain; charset=utf-8";
      if (asset.endsWith(".js")) {
        contentType = "application/javascript; charset=utf-8";
        if (asset === "assets/app.js") {
          body = replaceDivisions(body, await loadDivisions());
          body = body.replaceAll("/src/assets/images/", `${RAW}/src/assets/images/`);
        }
      } else if (asset.endsWith(".css")) {
        contentType = "text/css; charset=utf-8";
        body = body.replaceAll("url(/src/assets/images/", `url(${RAW}/src/assets/images/`);
      }
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Cache-Control", asset === "assets/app.js" ? "no-store" : "public, max-age=300");
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(body, { status: 200, headers });
    }

    let html = await fetchText("index.html");
    html = html
      .replace(/href="\/assets\/tailwind\.css[^\"]*"/g, `href="${base}?asset=assets/tailwind.css"`)
      .replace(/href="\/assets\/site\.css[^\"]*"/g, `href="${base}?asset=assets/site.css"`)
      .replace(/src="\/assets\/app\.js[^\"]*"/g, `src="${base}?asset=assets/app.js"`)
      .replace("ASAY ENERGY - Endüstriyel Güç & Enerji Çözümleri", "ASAY ENERGY — Supabase Canlı Önizleme");

    const headers = new Headers();
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("Cache-Control", "no-store");
    headers.set("Access-Control-Allow-Origin", "*");
    return new Response(html, { status: 200, headers });
  } catch (err) {
    const headers = new Headers();
    headers.set("Content-Type", "text/plain; charset=utf-8");
    return new Response(`ASAY Energy preview error: ${err instanceof Error ? err.message : String(err)}`, { status: 500, headers });
  }
});
