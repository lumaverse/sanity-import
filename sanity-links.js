import sanityClient from "@sanity/client";
import fetch from "node-fetch";
import csv from "csv-parser";
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

const slugsCsv = "./slugs-to-redirect.csv";

/* 
// Change slugs for array of posts to new ones from Steven
const query = `*[_type == "blog" && slug.current == $slugParam][0] {
    _id
  }`;

fs.createReadStream(slugsCsv)
	.pipe(csv())
	.on("data", (data) => {
		const params = { slugParam: data.from };
		const newSlug = data.to;

		client
			.fetch(query, params)
			.then((postId) => {
				return postId ? postId._id : "";
			})
			.then((postId) => {
				client
					.patch(postId)
					.set({
						slug: {
							_type: "slug",
							current: newSlug,
						},
					})
					.commit();
			});
	});
 */
/* 
// Create redirects for the same array of posts from date slugs to new slugs

fs.createReadStream(slugsCsv)
	.pipe(csv())
	.on("data", (data) => {
		const newRedirect = {
			_key: `sqsp-redirect-${data.to}`,
			_type: "redirect",
			destination: `/posts/${data.to}`,
			source: `/posts/${data.from}`,
			permanent: true,
		};

		// Append new redirects
		client
			.patch("redirects")
			.setIfMissing({ redirectList: [] })
			.append("redirectList", [newRedirect])
			.commit();

		// Delete all appended redirects
		client
			.patch("redirects")
			.unset([`redirectList[_key=="sqsp-redirect-${data.to}"]`])
			.commit();
	});
 */
/* 
// Create new CSV of all post titles for CG
const postTitles = await client.fetch(
`*[_type == "blog"]{title}`
);
postTitles.forEach(({title}) => {
    fs.appendFile("all-blog-titles.csv", `${title},\n`, (err) => {
        if (err) {
            console.error(err);
        }
    });
}) */