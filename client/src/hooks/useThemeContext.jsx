import ThemeContext from "../context/ThemeContext";
import { useContext } from "react";

const useThemeContext = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw Error("An error has occurred.");
    }

    return context;
}

export default useThemeContext;