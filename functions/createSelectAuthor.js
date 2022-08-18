import { JSDOM } from "jsdom";

export default async function createSelectAuthor(url, body, authors) {
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
