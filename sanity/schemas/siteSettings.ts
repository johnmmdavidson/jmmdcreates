import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "bio", title: "Bio" },
    { name: "contact", title: "Contact" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "artistName",
      title: "Artist Name",
      type: "string",
      group: "identity",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "artistStatement",
      title: "Artist Statement",
      type: "array",
      group: "identity",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                  },
                ],
              },
            ],
          },
        },
      ],
      description: "A few lines displayed on the homepage below the artist name.",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      group: "bio",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bioImage",
      title: "Bio Image",
      type: "image",
      group: "bio",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      group: "contact",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title Override",
      type: "string",
      group: "seo",
      description:
        "Override homepage <title>. Default: {artistName} — Sculptor, Woodworker & Fiber Artist in Seattle",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description Override",
      type: "string",
      group: "seo",
      description: "Override homepage meta description. Max ~155 characters.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "ogImage",
      title: "Default Social Image",
      type: "image",
      group: "seo",
      description:
        "Default Open Graph image for social sharing. Falls back to first image of most recent piece.",
    }),
  ],
  preview: {
    select: { title: "artistName" },
    prepare({ title }) {
      return { title: title || "Site Settings" };
    },
  },
});
