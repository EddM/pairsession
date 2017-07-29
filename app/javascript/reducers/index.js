const initialState = {
  clientID: null,
  document: {
    contents: "",
    collaborators: {}
  }
};

const reducers = (state = initialState, action) => {
  switch (action.type) {
    case 'DOCUMENT_RECEIVED':
      return {
        ...state,
        document: action.document,
      };
    case 'CLIENT_ID_RECEIVED':
      return {
        ...state,
        clientID: action.clientID,
      }
    case 'COLLABORATOR_RECEIVED':
      return {
        ...state,
        document: {
          ...state.document,
          collaborators: {
            ...state.document.collaborators,
            [action.collaborator.id]: action.collaborator
          }
        }
      }
    default:
      return state;
  }
}

export default reducers;
