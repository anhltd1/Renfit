/**
 * Fixed banner displayed at the top of the landing page when in preview mode.
 * Indicates that the content shown is the draft — not yet published.
 */
export function PreviewBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0F6B3E] text-white text-center py-2 text-sm leading-relaxed font-medium">
      Bản xem trước — chưa xuất bản
    </div>
  );
}
