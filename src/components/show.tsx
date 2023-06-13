import { ReactElement } from "react";

type MapNonNullable<T> = {
    [K in keyof T]: NonNullable<T[K]>;
};

type ShowPropChild<T> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ((item: T extends ReadonlyArray<any> ? MapNonNullable<T> : NonNullable<T>) => ReactElement)
    | ReactElement;

type ShowProps<T> = {
    when: T | undefined | null | false;
    fallback?: ReactElement;
    children: ShowPropChild<T>;
};

export function Show<T>({ when, fallback, children }: ShowProps<T>) {
    if (!when) {
        return fallback ?? null;
    }

    if (Array.isArray(when)) {
        if (when.length === 0) {
            return fallback ?? null;
        }

        const allTrue = when.every((item) => !!item);
        if (allTrue) {
            if (children instanceof Function) {
                return handleChildren(children, when);
            } else {
                return children;
            }
        }
        return fallback ?? null;
    }

    return handleChildren(children, when);
}

function handleChildren<T>(children: ShowPropChild<T>, item: T) {
    if (children instanceof Function) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return children(item as any);
    } else {
        return children;
    }
}
