import { htmlToBlocks } from "@sanity/block-tools";
import { JSDOM } from "jsdom";

export default async function createBlogAuthImgArr(author, data, cleanBody, imageArr) {
	const post = {
		_createdAt: new Date(data.item.publishOn).toISOString(),
		_id: `sqsp_post_${data.item.id.trim()}`,
		_type: "blog",
		title: data.item.title,
		slug: { _type: "slug", current: data.item.urlId.split("/").pop() },
		content: htmlToBlocks(cleanBody, blockContentType, {
			parseHtml: (html) => {
				return new JSDOM(html).window.document;
			},
		}),
		cta: {
			_ref: "e06c474e-b796-494f-a340-fdf991d7c4ef",
			_type: "reference",
		},
		socialShare: true,
	};
	return [author, post, imageArr];
}