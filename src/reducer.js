export const initialState = {
  rooms: null,
  user: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };
    case "SET_ROOMS":
      return {
        ...state,
        rooms: action.rooms,
      };

    default:
      return state;
  }
};

export default reducer;
