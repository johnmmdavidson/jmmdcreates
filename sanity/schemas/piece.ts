import { defineField, defineType } from "sanity";

export default defineType({
  name: "piece",
  title: "Piece",
  type: "document",
  orderings: [
    {
      title: "Date, Newest",
      name: "endDateDesc",
      by: [{ field: "endDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      date: "endDate",
      media: "images.0",
    },
    prepare({ title, date, media }) {
      const formatted = date
        ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "";
      return {
        title,
        subtitle: formatted,
        media,
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      options: { dateFormat: "MMMM YYYY" },
      description: "Month/year work began. Leave blank if same as end date.",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      options: { dateFormat: "MMMM YYYY" },
      validation: (Rule) => Rule.required(),
      description: "Month/year work was completed. Used for sorting.",
    }),
    defineField({
      name: "materials",
      title: "Materials",
      type: "string",
      description: 'Free text, e.g. "Walnut, hand-dyed indigo yarn"',
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
    }),
    defineField({
      name: "depth",
      title: "Depth",
      type: "number",
      description: "If present, piece is treated as 3D.",
    }),
    defineField({
      name: "dimensionUnit",
      title: "Dimension Unit",
      type: "string",
      options: {
        list: [
          { title: "Inches", value: "in" },
          { title: "Centimeters", value: "cm" },
          { title: "Feet", value: "ft" },
        ],
      },
      initialValue: "in",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
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
      description: "Optional short text about the piece.",
    }),
  ],
});
