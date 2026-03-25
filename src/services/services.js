// Ia toate datele
export async function getAllUta() {
  const res = await fetch("/api/uta");
  if (!res.ok) throw new Error("Eroare la fetch");
  return res.json();
}

// Ia un singur rand dupa id
export async function getUtaById(id) {
  const res = await fetch(`/api/uta/${id}`);
  if (!res.ok) throw new Error(`Eroare la fetch ${id}`);
  return res.json();
}