export type LiveGift = {
  id: string;
  sender: string;
  gift_name: string;
  amount: number;
};

export async function fetchRecentGifts(_roomId: string): Promise<LiveGift[]> {
  return [];
}

export async function onGift(
  _roomId: string,
  handler: (gift: LiveGift) => void
): Promise<() => void> {
  return () => {};
}