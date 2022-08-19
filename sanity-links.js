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

// Change slugs for array of posts to new ones from Steven
const slugsCsv = "./slugs-to-change.csv";
const query = `*[_type == "blog" && slug.current == $slugParam][0] {
    _id
  }`;
const urlArr = [];

function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep(fn, ...args) {
	await timeout(7000);
	return await fn(...args);
}

const rstream = fs.createReadStream(slugsCsv).pipe(csv());
rstream.on("data", async (data) => {
	if (data) {
		// Send blog post to Sanity
		const params = { slugParam: data.from };
		const newSlug = data.to;
		try {
			client
				.fetch(query, params)
				.then(async (postId) => {
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
		} catch (err) {
			console.error(err);
		}
	} else {
		console.log(`bad: ${data}`);
	}
});

// Create redirects for the same array of posts from date slugs to new slugs
