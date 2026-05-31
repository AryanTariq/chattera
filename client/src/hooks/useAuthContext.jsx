import AuthContext from "../context/AuthContext";
import { useContext } from "react";

const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw Error("An error has occurred.");
    }

    return context;
}

export default useAuthContext;