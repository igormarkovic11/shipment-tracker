export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  confirmed: ['picked_up'],
  picked_up: ['departed'],
  departed: ['arrived_at_hub'],
  arrived_at_hub: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
};
