export type UploadResponse = {
  url?: string;
  error?: string;
};

export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    if (message.includes("expected pattern")) {
      throw new Error(
        "Upload failed in this browser. Try a JPG or PNG, or use Chrome on desktop."
      );
    }
    throw new Error(message || "Upload failed. Check your connection and try again.");
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = (await response.text()).trim();
    throw new Error(
      text.slice(0, 180) || `Upload failed (${response.status}). Try a smaller JPG or PNG.`
    );
  }

  let body: UploadResponse;

  try {
    body = (await response.json()) as UploadResponse;
  } catch {
    throw new Error(`Upload failed (${response.status}). Server returned an invalid response.`);
  }

  if (!response.ok || !body.url) {
    throw new Error(body.error || `Upload failed (${response.status}).`);
  }

  return body.url;
}
