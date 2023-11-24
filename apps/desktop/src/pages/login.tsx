import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "@solidjs/router";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { useUser } from "../hooks/useUser";
import { createEffect, createSignal } from "solid-js";
import { z } from "zod";
import { cn } from "../utils/ui";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export const Login = () => {
    const queryClient = useQueryClient();
    const [formError, setFormError] = createSignal({ email: "", password: "" });

    const user = useUser();
    const mutation = createMutation(() => ({
        mutationKey: ["user", "login"],
        mutationFn: async (data: object) => {
            return axios
                .post("http://localhost:3001/api/v1/auth/login", data, { withCredentials: true })
                .then(() => {
                    // Ensure that the user query is invalidated so that the user is fetched again
                    queryClient.invalidateQueries({ queryKey: ["user", "me"] });
                    navigate("/");
                })
                .catch((err) => {
                    throw new Error(err.response.data.message ?? "Unknown error");
                });
        },
    }));

    const navigate = useNavigate();

    createEffect(() => {
        if (user.data?.id) {
            navigate("/");
        }
    }, [user.data]);

    return (
        <div class={"h-full flex justify-center"}>
            <div class={"w-full h-full flex flex-col items-center pt-14 gap-8"}>
                <h1 class={"text-3xl text-slate-950 dark:text-white font-bold tracking-wider"}>Login</h1>
                <div class={"text-white"}>{mutation.error?.message}</div>
                <form
                    class={"flex flex-col gap-3 "}
                    onSubmit={(event) => {
                        event.preventDefault();
                        setFormError({ email: "", password: "" });
                        const formData = new FormData(event.target as HTMLFormElement);
                        const validator = loginSchema.safeParse(Object.fromEntries(formData.entries()));
                        if (!validator.success) {
                            const fieldErrors = validator.error.flatten().fieldErrors;
                            setFormError({
                                email: fieldErrors.email?.join(", ") ?? "",
                                password: fieldErrors.password?.join(", ") ?? "",
                            });
                            return;
                        }

                        mutation.mutate(validator.data);
                    }}
                >
                    <Input
                        name="email"
                        type="text"
                        placeholder="username"
                        class={cn({ "border-2 border-rose-500 dark:border-rose-500 ": formError().email !== "" })}
                    />
                    {formError().email !== "" && <span class={"text-red-500"}>{formError().email}</span>}
                    <div class={"bottom-1"}>
                        <Input
                            type="password"
                            name="password"
                            placeholder="password"
                            class={cn({
                                "border-2 border-rose-500 dark:border-rose-500 ": formError().password !== "",
                            })}
                        />
                        {formError().password !== "" && <span class={"text-red-500"}>{formError().password}</span>}
                    </div>
                    <Button type={"submit"}>Login</Button>
                </form>
                <div class={"w-11/12 h-1 rounded-xl bg-red-500"}></div>
                <Link href={"/register"}>Register</Link>
            </div>
        </div>
    );
};
