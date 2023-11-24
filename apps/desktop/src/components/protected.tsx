import { JSX, Match, Switch, createEffect } from "solid-js";
import { useUser } from "../hooks/useUser";
import { Navigate } from "@solidjs/router";
import { Spinner } from "./spinner";

export type ProtectedProps = {
    children?: JSX.Element;
};
export const Protected = (props: ProtectedProps) => {
    const state = useUser();

    // createEffect(() => {
    //     console.trace(state.data, state.error, state.isLoading);
    // });
    return (
        <Switch fallback={<div>An error has occured</div>}>
            <Match when={state.isLoading}>
                <div class={"w-full h-full flex items-center justify-center"}>
                    <Spinner />
                </div>
            </Match>
            <Match when={state.error}>
                <Navigate href={"/login"} />
            </Match>
            <Match when={state.data && !state.isLoading}>{props.children}</Match>
        </Switch>
    );
};
