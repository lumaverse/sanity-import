import Schema from "@sanity/schema";

const blogSchema = Schema.default.compile({
	name: "default",
	types: [
		{
			name: "blog",
			title: "Blog Posts",
			type: "document",
			fields: [
				{
					name: "title",
					title: "Title",
					type: "string",
					description: "Required",
					validation: (Rule) => Rule.required(),
				},
				{
					name: "slug",
					title: "Slug",
					type: "slug",
					description: "Required",
					options: {
						source: "title",
					},
					validation: (Rule) => Rule.required(),
				},
				{
					name: "metaDesc",
					title: "Meta Description",
					description:
						"Optional: If left empty, the first paragraph of content is used instead",
					type: "text",
					rows: 3,
					validation: (Rule) =>
						Rule.max(200).error(
							"Meta descriptions can't be longer than 200 characters"
						),
				},
				{
					name: "author",
					title: "Author",
					type: "reference",
					to: [{ type: "author" }], // References another document
				},
				{
					name: "heroImage",
					title: "Hero Image",
					type: "image",
					description:
						"Required: The hero is a 16:9 aspect ratio, sized 1200x675; Facebook recommends 1200x630. Images are auto-resized for SEO and also reused as a meta-image for social media. Try the hotspot/crop tool to adjust in Sanity.",
					fields: [
						{
							name: "alt",
							title: "Alt Tag",
							type: "string",
							options: {
								isHighlighted: true, // Make this field easily accessible
							},
							validation: (Rule) => Rule.required(),
						},
					],
					options: {
						hotspot: true, // Enables UI for selecting center and crop of images
					},
					validation: (Rule) => Rule.required(),
				},
				{
					// Should build the frontend
					name: "youtubeHero",
					title: "YouTube Hero",
					description:
						"Paste in the link to the YouTube video you want displayed at the top of this blog post. If used, the video will be used on the post and the hero image placed above will display on the blog list page and in search results.",
					type: "youtube",
				},
				{
					name: "content",
					title: "Content",
					description:
						"Required: The first paragraph is displayed below the title on the home page of the blog.",
					type: "array",
					of: [
						{
							type: "block", // WYSIWYG editor
							styles: [
								{ title: "Normal", value: "normal" },
								{ title: "H1", value: "h1" },
								{ title: "H2", value: "h2" },
								{ title: "H3", value: "h3" },
								{ title: "H4", value: "h4" },
								{ title: "H5", value: "h5" },
								{
									title: "Pull Quote",
									value: "blockquote",
								},
							],
							marks: {
								annotations: [
									{
										name: "internalLink",
										title: "Internal link",
										type: "object",
										fields: [
											{
												name: "reference",
												title: "Reference",
												type: "reference",
												to: [
													{ type: "author" },
													{ type: "blog" },
													{ type: "tag" },
												],
											},
											{
												name: "blank",
												title: "Open in new tab",
												type: "boolean",
												description:
													"Read https://css-tricks.com/use-target_blank/",
												initialValue: false,
											},
										],
										blockEditor: {
											icon: () => "IL",
										},
									},
									{
										name: "link",
										title: "External Link",
										type: "object",
										fields: [
											{
												name: "href",
												title: "URL",
												type: "url",
											},
											{
												name: "blank",
												title: "Open in new tab",
												type: "boolean",
												description:
													"Read https://css-tricks.com/use-target_blank/",
												initialValue: false,
											},
										],
										blockEditor: {
											icon: () => "EL",
										},
									},
								],
							},
						},
						{
							name: "image",
							title: "Image",
							type: "image",
							description:
								"This image is displayed at 800x500. Try the hotspot/crop tool to adjust in Sanity.",
							fields: [
								{
									name: "alt",
									title: "Alt Tag",
									type: "string",
									options: {
										isHighlighted: true, // Make this field easily accessible
									},
									validation: (Rule) => Rule.required(),
								},
								{
									name: "caption",
									title: "Caption",
									type: "string",
									options: {
										isHighlighted: true, // Make this field easily accessible
									},
								},
							],
							options: {
								hotspot: true, // Enables UI for selecting center and crop of images
							},
						},
					],
					validation: (Rule) => Rule.required(),
				},
				{
					name: "tags",
					title: "Tags",
					type: "array",
					description: "Select 0-3 tags that relate to this post",
					of: [
						{
							name: "tag",
							title: "tag",
							type: "reference",
							to: [{ type: "tag" }], // References another document
						},
					],
					validation: (Rule) => Rule.max(3).unique(),
				},
				{
					name: "cta",
					title: "CTA",
					type: "reference",
					description: "Select the CTA to display at the bottom of the post",
					to: [{ type: "cta" }],
				},
				{
					name: "socialShare",
					title: "Social Share",
					type: "boolean",
					description:
						"Toggles the social share icons (Facebook, Twitter, LinkedIn)",
					initialValue: true,
				},
			],
		},
	],
});

export default blogSchema;
