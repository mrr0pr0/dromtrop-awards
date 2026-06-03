export function isUniqueViolation(err: unknown): boolean {
  if (err && typeof err === "object") {
    const code = (err as { code?: string }).code;
    if (code === "23505") return true;
    const message = (err as { message?: string }).message ?? "";
    return (
      message.toLowerCase().includes("unique") ||
      message.toLowerCase().includes("duplicate")
    );
  }
  return false;
}
