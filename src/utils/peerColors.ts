/**
 * Color palette for peer cursors in live pair coding.
 * Ensures good contrast and visibility for multiple simultaneous cursors.
 */
const PEER_CURSOR_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400' },
  { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-400' },
  { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-400' },
  { bg: 'bg-cyan-500', text: 'text-black', border: 'border-cyan-400' },
  { bg: 'bg-amber-500', text: 'text-black', border: 'border-amber-400' },
  { bg: 'bg-lime-500', text: 'text-black', border: 'border-lime-400' },
  { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-400' },
  { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-400' },
];

/**
 * Generate a stable color for a peer based on their ID.
 * Same peer ID will always get the same color.
 */
export function getPeerCursorColor(peerId: string, index?: number): typeof PEER_CURSOR_COLORS[0] {
  // Use provided index if available, otherwise hash the peerId
  const colorIndex = index ?? Math.abs(
    peerId.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0)
  ) % PEER_CURSOR_COLORS.length;
  
  return PEER_CURSOR_COLORS[colorIndex];
}

/**
 * Get all available peer cursor colors
 */
export function getAllPeerCursorColors() {
  return PEER_CURSOR_COLORS;
}

/**
 * Get color count for limiting simultaneous peers
 */
export function getPeerCursorColorCount() {
  return PEER_CURSOR_COLORS.length;
}
