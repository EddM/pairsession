export const receivedDocumentContents = (contents) => {
  return {
    type: "DOCUMENT_RECEIVED_CONTENTS",
    contents,
  };
};

export const receivedClientID = (clientID) => {
  return {
    type: "CLIENT_ID_RECEIVED",
    clientID,
  };
};
