import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./lib/sanity/env";
import { schemaTypes } from "./sanity/schemas";

const SINGLETONS = new Set(["profile"]);

/** ID of the existing profile document; the Studio opens it directly as a singleton. */
const PROFILE_ID = process.env.NEXT_PUBLIC_SANITY_PROFILE_ID || "c2e7b700-55af-4ccc-8dcc-b1e6cf5975c7";

export default defineConfig({
  name: "babafemi-codes",
  title: "babafemicodes.dev",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Profile").id("profile").child(S.document().schemaType("profile").documentId(PROFILE_ID)),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => !SINGLETONS.has(item.getId() ?? "")),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
});
