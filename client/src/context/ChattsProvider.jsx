import { useReducer } from 'react';
import ChattsContext from "./ChattsContext";

// Reducer function for different actions
const chattsReducer = (state, action) => {
    switch (action.type) {
        case "SET_CHATTS":
            return {
                ...state,
                chatts: action.payload
            };
        case "CREATE_CHATT":
            return {
                ...state,
                chatts: [action.payload, ...state.chatts]
            };
        case "DELETE_CHATT":
            return {
                ...state,
                chatts: state.chatts.filter((chatt) => chatt._id !== action.payload._id)
            };
        case "UPDATE_CHATT":
            return {
                ...state,
                chatts: state.chatts.map((chatt) =>
                    chatt._id === action.payload._id ? action.payload : chatt
                )
            };
        default:
            return {...state};
    }
};

export const ChattContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(chattsReducer, { chatts: [] });

    return (
        <ChattsContext.Provider value={{...state, dispatch}}>
            { children }
        </ChattsContext.Provider>
    )
}

export default ChattContextProvider;