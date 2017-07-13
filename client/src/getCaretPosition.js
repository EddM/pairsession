export default (editableDiv) => {
  let caretPos = 0;

  if (window.getSelection) {
    const sel = window.getSelection();

    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);

      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    const range = document.selection.createRange();

    if (range.parentElement() == editableDiv) {
      const tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);

      const tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }

  return caretPos;
};