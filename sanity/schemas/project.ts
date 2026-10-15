import { defineArrayMember, defineField, defineType } from "sanity";

export const projectSchema = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug (v2)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description: "Used by the terminal (`project <slug>`). Generated from the title when empty.",
    }),
    defineField({ name: "client", title: "Client / Company (v2)", type: "string" }),
    defineField({ name: "role", title: "Role (v2)", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Card summary.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Case Study (v2)",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      description: "Long-form write-up shown in the HUD project inspector.",
    }),
    defineField({
      name: "metrics",
      title: "Outcome Metrics (v2)",
      type: "array",
      of: [{ type: "string" }],
      description: 'Short results, e.g. "Review time: hours → < 2 min".',
    }),
    defineField({ name: "thumbnail", title: "Thumbnail", type: "image", options: { hotspot: true } }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Mobile", value: "mobile" },
          { title: "Web", value: "web" },
          { title: "Full Stack", value: "fullstack" },
          { title: "Backend", value: "backend" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "extras",
      title: "Extras",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }) => parent?.category !== "fullstack",
      options: {
        list: [
          { title: "Mobile", value: "mobile" },
          { title: "Web", value: "web" },
          { title: "API", value: "api" },
          { title: "CMS", value: "CMS" },
        ],
      },
    }),
    defineField({ name: "repository", title: "GitHub Repository URL", type: "url" }),
    defineField({
      name: "liveUrls",
      title: "Live URLs",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "link", title: "Link", type: "url" }),
          ],
          preview: { select: { title: "title", subtitle: "link" } },
        }),
      ],
    }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Display Order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", subtitle: "category", media: "thumbnail" } },
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
});
