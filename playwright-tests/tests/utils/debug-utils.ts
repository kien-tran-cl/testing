export const isDebug = process.env.DEBUG_LOGS === "true";

export function debugLog(...args: any[]) {
    if (isDebug) {
        console.log("[DEBUG]", ...args);
    }
}
