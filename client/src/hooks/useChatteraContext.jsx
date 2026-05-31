import ChattsContext from "../context/ChattsContext";
import { useContext } from "react";

const useChattsContext = () => {
    const context = useContext(ChattsContext);

    if (!context) {
        throw Error("An error has occurred.");
    }

    return context;
}

export default useChattsContext;