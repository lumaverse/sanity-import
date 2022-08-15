import sanityClient from "@sanity/client";
import { htmlToBlocks } from "@sanity/block-tools";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import blogSchema from "./compiled-schema.js";
import allBlogs from "./validBlogs-pt1.js";
import fs from "fs";
import credentials from "./credentials.js";

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
	"https://blog.timetap.com/blog/class-session-registration-scheduling",
]; */

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
	const nextBlog = allBlogs.shift()
	try {

		// Create the dictionary of redirects
		await createDictionary(nextBlog);
		
		/* await sleep(
			await fetch(`${allBlogs[i]}?format=json-pretty`)
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
		); */
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

async function createSelectAuthor(url, body, authors) {
	// Grab the author from the imported post
	const bodyObj = new JSDOM(body).window.document;
	const allPara = bodyObj.querySelectorAll("p");
	const postAuthor =
		Array.from(allPara)
			.filter((node) => node.innerHTML.includes("by"))
			.filter((el) => el.innerHTML.includes("<strong><em>"))
			.map((el) =>
				el.innerHTML.split("<strong><em>")[1].split("</em></strong>")[0].trim()
			)
			.pop() || "";

	// If there's no author line return default TT Team author
	if (!postAuthor) {
		return {
			_id: "f31dc9f5-a036-4448-a9df-fc51b9dc6fac",
			_type: "author",
			name: "TimeTap Team",
			slug: "timetap-team",
		};
	}

	// If author exists in Sanity, return existing
	let existingAuth = "";
	authors.forEach((auth) => {
		if (auth.name !== postAuthor) {
			return;
		}
		return (existingAuth = auth);
	});

	if (existingAuth) {
		return existingAuth;
	}

	const slug = postAuthor.toLowerCase().replace(" ", "-");
	if (slug.includes(" ")) {
		console.error(`${url} has an author problem`);
	}

	console.log(slug);

	// Otherwise, create new author object
	return {
		_id: `sqsp-author-${slug}`,
		_type: "author",
		name: postAuthor,
		slug: { _type: "slug", current: slug },
	};
}

async function cleanBodyContent(body) {
	const bodyObj = new JSDOM(body).window.document;
	// Look for these tags
	const emNodeList = bodyObj.querySelectorAll("em");
	const ctaNodeList = bodyObj.querySelectorAll(
		"div.sqs-block-button-container"
	);
	let hasCta = ctaNodeList.length !== 0 ? 1 : 0;

	// If no author, return body content as string
	emNodeList.forEach((em) => {
		if (!em.innerHTML === "by " || !em.innerHTML === "by: ") {
			return body;
		}
	});

	// Remove author from body
	emNodeList.forEach((em) => {
		if (em.innerHTML === "by " || em.innerHTML === "by: ") {
			em.nextSibling.remove();
			em.remove();
		}
	});

	// If no CTA, return body content as string with no author
	if (hasCta === 0) {
		return bodyObj.documentElement.outerHTML;
	}

	// Return body content as string with no author and no cta
	ctaNodeList.forEach((cta) => {
		cta.remove();
	});
	return bodyObj.documentElement.outerHTML;
}

async function grabImages(data) {
	const bodyObj = new JSDOM(data.item.body);
	const promotedObj = new JSDOM(data.item.promotedBlock);
	if (
		!data.item.body.includes("img") &&
		!data.item.promotedBlock.includes("p")
	) {
		return;
	}

	const bodyImg = bodyObj.window.document.querySelectorAll("img");
	const heroImg = promotedObj.window.document.querySelectorAll("img");

	const bodyArr = Array.from(bodyImg).map((img) => {
		return img.getAttribute("src");
	});
	const heroArr = Array.from(heroImg).map((img) => {
		return img.getAttribute("src");
	});

	const imageArr = [
		...heroArr.filter((img) => img !== null),
		...bodyArr.filter((img) => img !== null),
	];

	return imageArr;
}

async function createBlogAuthImgArr(author, data, cleanBody, imageArr) {
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

async function createBlogPatchAuthImages([author, blog, imageArr]) {
	try {
		let counter = 0;

		const newAuth = await client.createOrReplace(author);

		await client.createOrReplace(blog);

		imageArr.forEach(async (img, index) => {
			await fetch(img)
				.then((res) => res.buffer())
				.then((buffer) => client.assets.upload("image", buffer))
				.then(async (imageAsset) => {
					if (index === 0) {
						// If this is the the first image, set hero and author
						return client
							.patch(blog._id)
							.set({
								heroImage: {
									_type: "image",
									asset: {
										_type: "reference",
										_ref: imageAsset._id,
									},
									alt: blog.title,
								},
								author: {
									_type: "document",
									_ref: newAuth._id,
									_type: "reference",
								},
							})
							.commit();
					}

					counter++;
					// For every other image
					const remainingImgs = await client
						.patch(blog._id)
						.setIfMissing({ content: [] })
						.append("content", [
							{
								_type: "image",
								alt: `${blog.title}-${counter}`,
								asset: {
									_ref: imageAsset._id,
									_type: "reference",
								},
							},
						])
						.commit({ autoGenerateArrayKeys: true });
				});
		});
	} catch (err) {
		console.error(err);
	}
}

async function createDictionary(blog) {
	const slug = blog.split("/blog/")[1];
	
	if (slug.split("/").length === 1) {
		return;
	}
	
	const shortSlug = slug.split("/").slice(-1);
	/* const redirectPatternJSON = `{"from": "${slug}",\n "to": "${shortSlug}"\n}`; */
	const redirectPatternCSV = `${slug}, ${shortSlug}`;

	fs.appendFile("redirect-links.csv", `${redirectPatternCSV},\n`, (err) => {
		if (err) {
			console.error(err);
		}
	});
}
