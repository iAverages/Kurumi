import { ColorMode } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";

type MonacoProps = {
    value: string;
    onChange: (value: string | undefined) => void;
    colorMode: ColorMode;
};

const Monaco: React.FC<MonacoProps> = (props) => {
    return (
        <Editor
            height={"calc(100% -  var(--chakra-sizes-16))"}
            language="markdown"
            theme={props.colorMode === "dark" ? "vs-dark" : "vs-light"}
            options={{
                wordWrap: "on",
            }}
            {...props}
        />
    );
};

export default Monaco;
