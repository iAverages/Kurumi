import { useState, useEffect, ForwardRefExoticComponent, MemoExoticComponent, RefAttributes } from "react";
import type { ExcalidrawAPIRefValue, ExcalidrawProps } from "@excalidraw/excalidraw/types/types";

type PublicExcalidrawProps = Omit<ExcalidrawProps, "forwardedRef">;

type Excalidraw = MemoExoticComponent<
    ForwardRefExoticComponent<PublicExcalidrawProps & RefAttributes<ExcalidrawAPIRefValue>>
>;

const Excalidraw: React.FC<ExcalidrawProps> = ({ ...props }) => {
    const [Comp, setComp] = useState<Excalidraw>();

    useEffect(() => {
        import("@excalidraw/excalidraw").then((comp) => {
            setComp(comp.Excalidraw);
        });
    }, []);

    return (
        <>
            <div className="h-[calc(100%_-_var(--chakra-sizes-16))] w-full">{Comp && <Comp {...props} />}</div>
        </>
    );
};

export default Excalidraw;
