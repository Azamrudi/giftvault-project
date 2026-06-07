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
    if (response.status === 404) {
      throw new Error("AI route not found. Make sure /api/generate-wish is deployed and the server is running.");
    }
    throw new Error(err.error || "Failed to generate greeting.");
  }
  return response.json() as Promise<{ text: string }>;
}
