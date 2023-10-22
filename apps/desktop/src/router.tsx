import { Route, Routes } from "@solidjs/router";
import { Home } from "./pages/home";

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/note/:id" element={<h1>Note</h1>} />
        </Routes>
    );
};
