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

// Create redirects for the same array of posts from date slugs to new slugs

fs.createReadStream(slugsCsv)
	.pipe(csv())
	.on("data", (data) => {
		const newRedirect = {
			_key: `sqsp-redirect-${data.to}`,
			_type: "redirect",
			destination: `https://timetap.com/blog/posts/${data.to}`,
			source: `/${data.from}`,
			permanent: true,
			basePath: false,
		};

		// Append new redirects
		client
			.patch("redirects")
			.setIfMissing({ redirectList: [] })
			.append("redirectList", [newRedirect])
			.commit();
			
		/* // Delete all appended redirects
		client
			.patch("redirects")
			.unset([`redirectList[_key=="sqsp-redirect-${data.to}"]`])
			.commit(); */
	});
