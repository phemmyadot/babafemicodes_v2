/** Every edition of the site. Each edition links to all the others from this one list. */
export const EDITIONS = [
  { href: "/", name: "Electric" },
  { href: "/kinetic", name: "Kinetic" },
  { href: "/command", name: "Command" },
  { href: "/exe", name: "Arcade" },
  { href: "/ide", name: "IDE" },
] as const;

export type EditionHref = (typeof EDITIONS)[number]["href"];

export const otherEditions = (current: EditionHref) => EDITIONS.filter((e) => e.href !== current);
