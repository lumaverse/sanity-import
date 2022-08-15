# Importing Data into Sanity
## Background on My Process
This project was created after I began importing SquaresSpace posts into Sanity. I started by grabbing a tiny snippet of HTML and iterating over that with JSDOM, then importing that into Sanity.

Next, I downloaded an image and figured out how to stream that as an upload into Sanity and then related it by ID to the test blog post also selected by ID.

Then, I began by grabbing one entire blog post in a JSON file (just appended `?format=json-pretty`) and iterated over it to grab the data I needed, then putting it into an object shape that was acceptable by Sanity.

Once that was good, I grabbed several more blog posts and iterated over all of them and debugged the errors in each. 

Finally, I opened the sitemap in a browser, opened inspector and used JS to select all blog posts. Then I copy/pasted that object into a JS file and iterated over that with my node script.

That required some more debugging because of interesting edge cases. And then it took a while to figure out how to get around the Sanity API request limit.

## Getting Set Up

1. Run `npm install`

2. Create a `credentials.js` file in root and add the projectId, dataset, and unique read/write token as key/value pairs inside the object.

3. Grab one chunk of data to test importing and put it inside of a `validBlogs-pt1.js` file

4. Run `node sanity-import.js`

## Additional Processes

1. I used the `createOrReplace()` function and consistent IDs to only update existing posts and prevent duplicating posts. 

2. I created a simple GROQ query which I used often to delete the posts I was trialing.

```client.delete({query: `*[_type == "blog" && slug.current != "test-1"]`}).then(console.log).catch(console.error)```

3. I created a dictionary as a record to show existing slugs and new/updated slugs (without dates). I then used `fs.appendfile()` to write the data to a JS file for iterating and then a CSV for the marketing team to review.