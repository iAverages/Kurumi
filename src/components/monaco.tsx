import Editor from "@monaco-editor/react";

type MonacoProps = {
    value: string;
    onChange: (value: string | undefined) => void;
};

const Monaco: React.FC<MonacoProps> = (props) => {
    return <Editor height={"calc(100% -  var(--chakra-sizes-16))"} language="markdown" theme="vs-dark" {...props} />;
};

export default Monaco;
