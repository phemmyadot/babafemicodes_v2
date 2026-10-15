import { defineField, defineType } from "sanity";

/** One document per category; rendered as a module panel in the Technical Arsenal. */
export const skillsSchema = defineType({
  name: "skills",
  title: "Skills",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Category Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: "order", title: "Display Order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title" } },
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
});
