import { createSignal } from "solid-js";

export const Home = () => {
    const [data, setData] = createSignal("");

    const click = async () => {
        const res = await fetch("http://localhost:3001/api/v1");
        if (!res.ok) {
            setData("Errored");
            console.log(res);
            return;
        }

        const body = await res.text();

        setData(body ?? "no body");
    };

    return (
        <div class={"flex flex-col"}>
            <p>awesome</p>
            <button onClick={click}>send req</button>
            <div class={"bg-red-500"}>{data()}</div>
        </div>
    );
};
