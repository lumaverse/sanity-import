import { JSDOM } from "jsdom";

export default async function cleanBodyContent(body) {
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