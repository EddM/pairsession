const initialState = {
  document: {
    contents: "",
    clientID: null,
  }
};

const reducers = (state = initialState, action) => {
  switch (action.type) {
    case 'DOCUMENT_RECEIVED_CONTENTS':
      return {
        ...state,
        document: {
          ...state.document,
          contents: action.contents,
        }
      };
    case 'CLIENT_ID_RECEIVED':
      return {
        ...state,
        document: {
          ...state.document,
          clientID: action.clientID,
        }
      }
    default:
      return state;
  }
}

export default reducers;
