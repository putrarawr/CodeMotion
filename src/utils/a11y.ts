/**
 * Accessibility utilities for screen reader announcements and ARIA live regions
 */

/**
 * Announce a message to screen readers using aria-live regions
 * @param message - The message to announce
 * @param priority - 'polite' for non-urgent, 'assertive' for urgent announcements
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Find or create live region
  let liveRegion = document.getElementById(`a11y-live-region-${priority}`);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `a11y-live-region-${priority}`;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  // Clear previous content and set new message
  liveRegion.textContent = '';
  
  // Use setTimeout to ensure screen reader picks up the change
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Announce export progress to screen readers
 */
export function announceExportProgress(current: number, total: number) {
  const percentage = Math.round((current / total) * 100);
  announceToScreenReader(`Export progress: ${percentage}% complete`, 'assertive');
}

/**
 * Announce when a snapshot is saved
 */
export function announceSnapshotSaved(name: string) {
  announceToScreenReader(`Snapshot "${name}" saved successfully`, 'polite');
}

/**
 * Announce when code is formatted
 */
export function announceCodeFormatted() {
  announceToScreenReader('Code formatted successfully', 'polite');
}

/**
 * Announce timer status
 */
export function announceTimerStatus(minutes: number, seconds: number) {
  announceToScreenReader(`Sprint timer: ${minutes} minutes ${seconds} seconds remaining`, 'assertive');
}

/**
 * Announce peer connection status
 */
export function announcePeerConnected(username: string) {
  announceToScreenReader(`${username} joined the live pair session`, 'polite');
}

/**
 * Announce peer disconnection
 */
export function announcePeerDisconnected(username: string) {
  announceToScreenReader(`${username} left the live pair session`, 'polite');
}
