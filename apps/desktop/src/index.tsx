/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "./router";
import { Router as SolidRouter } from "@solidjs/router";

import "./styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { SocketProvider } from "./context/socket";
import { ShortcutsManager } from "./components/shortcuts";

const queryClient = new QueryClient();

render(
    () => (
        <div class={"h-screen w-screen bg-slate-100 dark:bg-slate-900"}>
            <QueryClientProvider client={queryClient}>
                <SolidRouter>
                    <SocketProvider>
                        <ShortcutsManager>
                            <Router />
                        </ShortcutsManager>
                    </SocketProvider>
                </SolidRouter>
                <SolidQueryDevtools />
            </QueryClientProvider>
        </div>
    ),
    document.getElementById("root") as HTMLElement,
);
