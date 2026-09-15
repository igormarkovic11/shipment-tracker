const ALLOWED_TRANSITIONS = {
  confirmed: ["picked_up"],
  picked_up: ["departed"],
  departed: ["arrived_at_hub"],
  arrived_at_hub: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
};

function isValidTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

module.exports = { ALLOWED_TRANSITIONS, isValidTransition };
