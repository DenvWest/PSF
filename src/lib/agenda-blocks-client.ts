import type {
  AgendaBlockRecord,
  CreateAgendaBlockInput,
  UpdateAgendaBlockInput,
} from "@/types/agenda";

export async function fetchAgendaBlocks(
  startDate: string,
  endDate: string,
): Promise<AgendaBlockRecord[]> {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`/api/account/agenda-blocks?${params.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Kon agenda-blokken niet laden.");
  }
  const payload = (await response.json()) as { blocks?: AgendaBlockRecord[] };
  return payload.blocks ?? [];
}

export async function createAgendaBlock(
  input: CreateAgendaBlockInput,
): Promise<AgendaBlockRecord> {
  const response = await fetch("/api/account/agenda-blocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Kon blok niet toevoegen.");
  }
  const payload = (await response.json()) as { block: AgendaBlockRecord };
  return payload.block;
}

export async function updateAgendaBlock(
  blockId: string,
  input: UpdateAgendaBlockInput,
): Promise<AgendaBlockRecord> {
  const response = await fetch(`/api/account/agenda-blocks/${encodeURIComponent(blockId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Kon blok niet bijwerken.");
  }
  const payload = (await response.json()) as { block: AgendaBlockRecord };
  return payload.block;
}

export async function deleteAgendaBlock(blockId: string): Promise<void> {
  const response = await fetch(`/api/account/agenda-blocks/${encodeURIComponent(blockId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Kon blok niet verwijderen.");
  }
}
