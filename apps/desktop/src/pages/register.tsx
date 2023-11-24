import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "@solidjs/router";
import { useUser } from "../hooks/useUser";
import { createEffect } from "solid-js";

export const Register = () => {
    const user = useUser();
    const navigate = useNavigate();

    createEffect(() => {
        if (user.data !== undefined) {
            navigate("/");
        }
    }, [user.data]);

    return (
        <div class={"h-full flex justify-center"}>
            <div class={"w-full h-full flex flex-col items-center pt-14 gap-8"}>
                <h1 class={"text-3xl text-slate-950 dark:text-white font-bold tracking-wider"}>Register</h1>
                {/* <div class={"text-white"}>{mutation.error?.message}</div> */}
                <form
                    class={"flex flex-col gap-3"}
                    onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.target as HTMLFormElement);
                        const value = Object.fromEntries(data.entries());

                        console.log(value ?? "no value");
                        axios.post("http://localhost:3001/api/v1/auth/register", value).then((res) => {
                            console.log(res);
                        });
                    }}
                >
                    <Input type="text" placeholder="name" name="name" />
                    <Input type="text" placeholder="email" name="email" />
                    <Input type="password" placeholder="password" name="password" />
                    <Button type={"submit"}>Register</Button>
                </form>
                <div class={"w-11/12 h-1 rounded-xl bg-slate-800"}></div>
                <Link href={"/login"} class={"text-slate-600"}>
                    Login
                </Link>
            </div>
        </div>
    );
};
