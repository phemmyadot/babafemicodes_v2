/** Every edition of the site. Each edition links to all the others from this one list. */
export const EDITIONS = [
  { href: "/", name: "Arcade" },
  { href: "/electric", name: "Electric" },
  { href: "/kinetic", name: "Kinetic" },
  { href: "/command", name: "Command" },
  { href: "/ide", name: "IDE" },
] as const;

export type EditionHref = (typeof EDITIONS)[number]["href"];

export const otherEditions = (current: EditionHref) => EDITIONS.filter((e) => e.href !== current);
