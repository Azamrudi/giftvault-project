export async function generateAIWish(params: {
  recipientName: string;
  relationship: string;
  vibe: string;
  extraDetails?: string;
}): Promise<{ text: string }> {
  const response = await fetch("/api/generate-wish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate AI greeting.");
  }
  return response.json() as Promise<{ text: string }>;
}
