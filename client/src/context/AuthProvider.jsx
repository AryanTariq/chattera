import { useReducer } from 'react';
import AuthContext from "./AuthContext";

// Reducer function for different actions
const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload
            };
        case "LOGOUT":
            return {
                ...state,
                user: null
            };
        case "UPDATE_USER":
            return {
                ...state,
                user: action.payload
            };
        default:
            return { ...state };
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        // Refetch user data from local storage when page reloads
        user: JSON.parse(localStorage.getItem('user')) || null
    });
    
    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            { children }
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;