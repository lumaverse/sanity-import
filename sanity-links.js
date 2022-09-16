import sanityClient from "@sanity/client";
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
const redirectArr = [];

// Create redirects for the same array of posts from date slugs to new slugs
fs.createReadStream(slugsCsv)
	.pipe(csv())
	.on("data", (line) => {
		// Iterating over lines of data from the CSV
		const key = line.to.split("/posts/")[1];
		const source = line.from.split(".com")[1];
		const destination = line.to;

		redirectArr.push({
			_key: `sqsp-redirect-${key}`,
			_type: "redirect",
			basePath: false,
			destination: destination,
			permanent: true,
			source: source,
		});
	})
	.on("end", () => {
		// After streaming, push redirects as a batch to Sanity
		client
			.patch("redirects")
			.setIfMissing({ redirectList: [] })
			.append("redirectList", redirectArr)
			.commit();
	});

/* // Delete all appended redirects
client.patch("redirects").unset([`redirectList`]).commit();
 */