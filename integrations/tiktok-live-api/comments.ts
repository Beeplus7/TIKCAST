export type LiveComment = {
  id: string;
  user_handle: string;
  body: string;
  timestamp: string;
};

export async function fetchComments(_roomId: string): Promise<LiveComment[]> {
  // TODO: connect TikTok Live WebSocket / polling API
  return [];
}

export async function onComment(
  _roomId: string,
  handler: (comment: LiveComment) => void
): Promise<() => void> {
  // TODO: subscribe to live comment stream
  return () => {};
}