import { ExcalidrawAPIRefValue } from "@excalidraw/excalidraw/types/types";
import Monaco from "@monaco-editor/react";
import { useState, useEffect, ForwardRefExoticComponent, MemoExoticComponent, RefAttributes } from "react";

type Excalidraw = MemoExoticComponent<ForwardRefExoticComponent<RefAttributes<ExcalidrawAPIRefValue>>>;

const Excalidraw = () => {
    const [Comp, setComp] = useState<Excalidraw>();
    useEffect(() => {
        import("@excalidraw/excalidraw").then((comp) => {
            setComp(comp.Excalidraw);
        });
    }, []);

    return (
        <>
            <h1> Excalidraw with Next </h1>
            <div className="h-96 w-full">{Comp && <Comp />}</div>
        </>
    );
};

const Editor = () => {
    return (
        <>
            <Monaco height={"calc(50% -  var(--chakra-sizes-16))"} language="typescript" theme="vs-dark" />
            <div>
                <Excalidraw />
            </div>
        </>
    );
};

export default Editor;
