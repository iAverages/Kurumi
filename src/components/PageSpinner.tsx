import { Spinner } from "@chakra-ui/react";

const PageSpinner = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Spinner size={"xl"} />
        </div>
    );
};

export default PageSpinner;
