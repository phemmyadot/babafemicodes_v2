import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Singleton. Field names match the original babafemi.codes schema; fields marked
 * "v2" are optional additions used by the HUD site and ignored by the old one.
 */
export const profileSchema = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "contact", title: "Contact" },
    { name: "telemetry", title: "Stats & Credentials" },
  ],
  fields: [
    defineField({ name: "firstName", title: "First Name", type: "string", group: "identity", validation: (R) => R.required() }),
    defineField({ name: "lastName", title: "Last Name", type: "string", group: "identity", validation: (R) => R.required() }),
    defineField({
      name: "headline",
      title: "Headline (v2)",
      type: "string",
      group: "identity",
      description: 'Hero title. Use "|" to split main/sub, e.g. "Senior Software Engineer | Mobile & Full-Stack Systems Architecture". Falls back to the first Typewriter Title.',
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "identity", description: 'e.g. "Engineering Experiences. Shipping Solutions."' }),
    defineField({
      name: "titles",
      title: "Typewriter Titles",
      type: "array",
      group: "identity",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Roles cycled in the hero typewriter",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      group: "identity",
      of: [{ type: "text" }],
      description: "Each item is one paragraph. The HUD hero shows the first paragraph; the terminal `whoami` shows all.",
    }),
    defineField({ name: "avatar", title: "Avatar", type: "image", group: "identity", options: { hotspot: true } }),
    defineField({ name: "openToWork", title: "Open to Work", type: "boolean", group: "identity", initialValue: true }),
    defineField({ name: "location", title: "Location (v2)", type: "string", group: "identity" }),
    defineField({ name: "workStatus", title: "Work Authorization (v2)", type: "string", group: "identity", description: 'e.g. "US Permanent Resident"' }),

    defineField({ name: "email", title: "Email", type: "string", group: "contact" }),
    defineField({ name: "phone", title: "Phone (v2)", type: "string", group: "contact" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url", group: "contact" }),
    defineField({ name: "github", title: "GitHub URL", type: "url", group: "contact" }),
    defineField({ name: "hashnode", title: "Hashnode URL", type: "url", group: "contact" }),
    defineField({
      name: "resume",
      title: "Resume",
      type: "file",
      group: "contact",
      description: "Upload your resume PDF — served via Sanity CDN",
      options: { accept: ".pdf" },
    }),

    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "telemetry",
      description: "Shown as the live telemetry panels on the HUD site.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "unit", title: "Unit (v2)", type: "string", description: 'e.g. "YRS", "APPS"' }),
            defineField({ name: "detail", title: "Detail (v2)", type: "string" }),
            defineField({
              name: "signal",
              title: "Graph signal (v2)",
              type: "string",
              options: { list: ["rising", "steady", "spiky", "wave"] },
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      group: "telemetry",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'Format "Title (CODE) | Issuer" is parsed automatically on the HUD site.',
            }),
            defineField({ name: "url", title: "URL", type: "url", description: "Link to Credly badge or credential page" }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "education",
      title: "Education (v2)",
      type: "array",
      group: "telemetry",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "degree", title: "Degree", type: "string" }),
            defineField({ name: "institution", title: "Institution", type: "string" }),
            defineField({ name: "year", title: "Year", type: "string" }),
          ],
          preview: { select: { title: "degree", subtitle: "institution" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { first: "firstName", last: "lastName", media: "avatar" },
    prepare: ({ first, last, media }) => ({ title: `${first ?? ""} ${last ?? ""}`.trim() || "Profile", media }),
  },
});
