export async function trackClick(data: {
  product_id: string;
  product_naam?: string;
  categorie?: string;
  pagina?: string;
}) {
  try {
    const res = await fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok && res.status !== 429) {
      console.warn("[trackClick] unexpected status", res.status);
    }
  } catch (e) {
    console.error("[trackClick] failed", e);
  }
}
