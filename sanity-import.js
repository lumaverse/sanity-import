import sanityClient from "@sanity/client";
import fetch from "node-fetch";
import fs from "fs";

import blogSchema from "./compiled-schema.js";
import credentials from "./credentials.js";
import createSelectAuthor from "./functions/createSelectAuthor";
import cleanBodyContent from "./functions/cleanBodyContent";
import grabImages from "./functions/grabImages";
import createBlogAuthImgArr from "./functions/createBlogAuthImgArr";
import createBlogPatchAuthImages from "./functions/createBlogPatchAuthImages";
import createDictionary from "./functions/createDictionary";

import allBlogs from "./validBlogs-pt1.js";

// Set up connection to Sanity
const client = sanityClient({
	projectId: credentials.projectId,
	dataset: credentials.dataset,
	token: credentials.token,
	apiVersion: "2022-01-18", //date project was initialized
	useCDN: false, // use true if you want optimized speeds with cached data
});

/* 
// Delete all posts
client.delete({query: `*[_type == "blog" && slug.current != "test-1"]`}).then(console.log).catch(console.error)
 */

/* 
// Test a blog or two
const allBlogs = [
	"https://blog.timetap.com/blog/2017/3/24/conference-room-reservations-made-easy-for-office-tenants-heres-how",
];
 */

// Grab the existing blog schema object
const blockContentType = blogSchema
	.get("blog")
	.fields.find((field) => field.name === "content").type;

// Get a list of existing authors
const authors = await client.fetch(
	`*[_type == "author"]{_id, _type, name, "slug":slug.current}`
);

function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep(fn, ...args) {
	await timeout(7000);
	return await fn(...args);
}

const allBlogsLength = allBlogs.length;
for (let i = 0; i < allBlogsLength; i++) {
	// Send blog post to Sanity
	const nextBlog = allBlogs.shift();
	try {
		// Create the dictionary of redirects
		await createDictionary(nextBlog);

		// Send to Sanity
		await sleep(
			await fetch(`${nextBlog}?format=json-pretty`)
				.then((res) => res.json())
				.then(async (data) => {
					console.log(data.item.title);
					console.log(allBlogs[i]);

					// Locate author obj or create new one
					const author = await createSelectAuthor(
						allBlogs[i],
						data.item.body,
						authors
					);

					// Strip author and CTAs from body of blog post, get back string
					const cleanBody = await cleanBodyContent(data.item.body);

					// Grab all image srcs from body and add hero src to front of array
					let imageArr = await grabImages(data);

					// Create new array containing author, blog, and image
					const authBlogImg = await createBlogAuthImgArr(
						author,
						data,
						cleanBody,
						imageArr
					);

					// Create the posts
					await createBlogPatchAuthImages(authBlogImg);
				})
		);
	} catch (err) {
		console.error(err);

		/* 
		// TODO Write broken links to a file
		if (!Object.values(err).includes("fn is not a function")) {
			fs.appendFile("brokenLinks.js", `"${singleBlog}",\n`, (err) => {
				if (err) {
					console.error(err);
				}
			});
		} */
	}
}
