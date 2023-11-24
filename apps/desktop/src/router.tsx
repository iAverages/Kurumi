import { Navigate, Outlet, Route, Routes } from "@solidjs/router";
import { Debug } from "./pages/debug";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Notes } from "./pages/notes";
import { Home } from "./pages/home";
import { useUser } from "./hooks/useUser";
import { Match, Switch } from "solid-js";
import { Spinner } from "./components/spinner";

const Protected = () => {
    const user = useUser();

    return (
        <Switch fallback={<div>An error has occured</div>}>
            <Match when={user.isLoading || user.isPlaceholderData}>
                <div class={"w-full h-full flex items-center justify-center"}>
                    <Spinner />
                </div>
            </Match>
            <Match when={user.error}>
                <Navigate href={"/login"} />
            </Match>
            <Match when={user.data?.id && !user.isLoading}>
                <Outlet />
            </Match>
        </Switch>
    );
};

const SelectNotes = () => {
    return (
        <div class={"flex flex-col text-white gap-3"}>
            <div>Select a note</div>
        </div>
    );
};
export const Router = () => {
    return (
        <Routes>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="" component={Protected}>
                <Route path="/debug" component={Debug} />
                <Route path="/" component={Home}>
                    <Route path="/" component={SelectNotes} />
                    <Route path="/notes/:id" component={Notes} />
                </Route>
            </Route>
        </Routes>
    );
};
