const getCaretPosition = (element) => {
  let caretOffset = 0;
  let node = null;

  if (typeof window.getSelection != "undefined") {
    const range = window.getSelection().getRangeAt(0);
    const preCaretRange = range.cloneRange();

    caretOffset = range.endOffset;
    node = range.commonAncestorContainer;
  } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
    const textRange = document.selection.createRange();
    const preCaretTextRange = document.body.createTextRange();

    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }

  return [node, caretOffset];
}

export default getCaretPosition;
