export type FieldValues = Record<string, any>;

export type UseFormProps<TFieldValues extends FieldValues = FieldValues> = Partial<{
    disabled: boolean;
    defaultValues: TFieldValues;
    values: TFieldValues;
}>;

export const useForm = <T extends FieldValues>(props: UseFormProps<T>) => {
    const register = () => {
        console.log("register");
    };

    const handleSubmit = (func: () => T) => {};

    return {
        register,
        handleSubmit,
    };
};
