/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "./router";
import { Router as SolidRouter } from "@solidjs/router";

import "./styles.css";

render(
    () => (
        <>
            hi
            <SolidRouter>
                <Router />
            </SolidRouter>
        </>
    ),
    document.getElementById("root") as HTMLElement,
);
