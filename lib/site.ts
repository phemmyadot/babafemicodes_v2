/** Site identity (not CMS content): the domain shown in the top bar and terminal prompt. */
export const SITE_DOMAIN = "babafemicodes.dev";
export const SITE_URL = `https://${SITE_DOMAIN}`;

/** "babafemicodes.dev" → ["babafemicodes", ".dev"] for two-tone wordmarks. */
export const [SITE_NAME, SITE_TLD] = [SITE_DOMAIN.replace(/\.[^.]+$/, ""), SITE_DOMAIN.slice(SITE_DOMAIN.lastIndexOf("."))];
