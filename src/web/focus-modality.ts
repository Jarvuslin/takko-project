/** Text fields match :focus-visible after a pointer click too. Track actual navigation modality. */
export function installFocusModality(doc: Document = document) {
  const pointer = () => {
    doc.documentElement.dataset.focusModality = "pointer";
  };
  const keyboard = (event: KeyboardEvent) => {
    if (!event.metaKey && !event.altKey && !event.ctrlKey)
      doc.documentElement.dataset.focusModality = "keyboard";
  };
  doc.documentElement.dataset.focusModality = "keyboard";
  doc.addEventListener("pointerdown", pointer, true);
  doc.addEventListener("keydown", keyboard, true);
  return () => {
    doc.removeEventListener("pointerdown", pointer, true);
    doc.removeEventListener("keydown", keyboard, true);
    delete doc.documentElement.dataset.focusModality;
  };
}
