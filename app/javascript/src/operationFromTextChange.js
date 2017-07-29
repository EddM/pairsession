import ot from 'ot';

// creates a diff between oldContent and newContent, returning an OT operation
// representing the diff
const operationFromTextChange = (oldContent, newContent) => {
  var op = new ot.TextOperation();

  if (oldContent == newContent) {
    return op;
  }

  var commonStart = 0;

  while (oldContent.charAt(commonStart) == newContent.charAt(commonStart)) {
    commonStart++;
  }

  var commonEnd = 0;

  while (oldContent.charAt(oldContent.length - 1 - commonEnd) == newContent.charAt(newContent.length - 1 - commonEnd)) {
    if (commonEnd + commonStart == oldContent.length) { break; }
    if (commonEnd + commonStart == newContent.length) { break; }

    commonEnd++;
  }

  op.retain(commonStart);

  if (oldContent.length != commonStart + commonEnd) {
    op.delete(oldContent.length - commonStart - commonEnd);
  }

  if (newContent.length != commonStart + commonEnd) {
    op.insert(newContent.slice(commonStart, newContent.length - commonEnd));
  }

  op.retain(commonEnd);

  return op;
};

export default operationFromTextChange;
