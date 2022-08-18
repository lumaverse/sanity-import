export default async function createBlogPatchAuthImages([author, blog, imageArr]) {
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