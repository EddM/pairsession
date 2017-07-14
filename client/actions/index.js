export const receivedDocument = (document) => {
  return {
    type: "DOCUMENT_RECEIVED",
    document,
  };
};

export const receivedClientID = (clientID) => {
  return {
    type: "CLIENT_ID_RECEIVED",
    clientID,
  };
};

export const receivedCollaborator = (collaborator) => {
  return {
    type: "COLLABORATOR_RECEIVED",
    collaborator,
  };
}
