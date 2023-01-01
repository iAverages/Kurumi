import { useState } from "react";

const useBoolean = () => {
    const [value, setValue] = useState(false);
    const toggle = () => setValue((v) => !v);
    const on = () => setValue(true);
    const off = () => setValue(false);
    return { value, toggle, on, off };
};

export default useBoolean;
