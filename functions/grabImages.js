import { JSDOM } from "jsdom";

export default async function grabImages(data) {
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