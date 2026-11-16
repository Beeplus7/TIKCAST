export type TimeoutRequest = {
  user_handle: string;
  duration_seconds: number;
  reason?: string;
};

export async function applyTimeout(_roomId: string, _req: TimeoutRequest): Promise<{ ok: boolean }> {
  // TODO: TikTok Live moderator timeout API
  return { ok: false };
}

export async function banUser(
  _roomId: string,
  _user_handle: string
): Promise<{ ok: boolean }> {
  return { ok: false };
}