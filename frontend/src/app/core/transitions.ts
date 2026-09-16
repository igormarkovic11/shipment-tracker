export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  confirmed: ['picked_up'],
  picked_up: ['departed', 'lost', 'damaged'],
  departed: ['arrived_at_hub', 'lost', 'damaged'],
  arrived_at_hub: ['out_for_delivery', 'lost', 'damaged'],
  out_for_delivery: ['delivered', 'lost', 'damaged', 'refused'],
  delivered: [],
  lost: [],
  damaged: [],
  refused: [],
};
