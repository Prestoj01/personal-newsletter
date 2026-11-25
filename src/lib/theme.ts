export type Theme = "day" | "night";

export const THEME_KEY = "extra-extra:theme";

/**
 * Runs inline in <head> before first paint so the night edition never flashes the day one:
 * the reader's saved choice, otherwise their system preference.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="day"&&t!=="night")t=matchMedia("(prefers-color-scheme: dark)").matches?"night":"day";document.documentElement.dataset.theme=t}catch(e){}})()`;
