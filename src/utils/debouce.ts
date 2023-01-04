/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Debouce function with "timeout" functionality
 * If the function does not run after timeout ms
 * then it will be ran anyway
 */
export const debounce = (func: (...args: any[]) => any, wait: number, timeout: number) => {
    let debounceTimeout: NodeJS.Timer;
    // If it does not "bounce" after timeout ms then the function will run
    let bouceTimeout: NodeJS.Timer | null = null;

    return function (...args: any[]) {
        const later = () => {
            clearTimeout(debounceTimeout);
            bouceTimeout && clearInterval(bouceTimeout);
            func(...args);
        };

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(later, wait);
        if (bouceTimeout === null) bouceTimeout = setTimeout(later, timeout);
    };
};
