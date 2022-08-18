import fs from "fs";

export default async function createDictionary(blog) {
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