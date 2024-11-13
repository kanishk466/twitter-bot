import { configDotenv } from "dotenv";
configDotenv();

import {TwitterApi} from "twitter-api-v2"

import cron from "node-cron"

import axios from "axios";

import fs from "fs"



// Twitter API Client
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  // List of posts
const posts = [
    {
      text: "Hello, World! #example",
      image: "https://images.pexels.com/photos/26447251/pexels-photo-26447251/free-photo-of-cat-laying-against-pink-wall-background.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      text: "This is another tweet! #hashtag",
      image: "https://images.pexels.com/photos/29339872/pexels-photo-29339872/free-photo-of-creative-outdoor-pink-art-installation.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    // Add more posts as needed
  ];

  // Function to post a tweet
async function postTweet(post) {
    try {
      let mediaId;
      if (post.image) {
        // Download the image
        const response = await axios.get(post.image, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
  
        // Save image temporarily
        fs.writeFileSync('temp.jpg', imageBuffer);
  
        // Upload image to Twitter
        const mediaResponse = await twitterClient.v1.uploadMedia('temp.jpg');
        mediaId = mediaResponse;
        
        // Delete temporary file
        fs.unlinkSync('temp.jpg');
      }
  
      // Post the tweet with or without the image
      await twitterClient.v1.tweet(post.text, { media_ids: mediaId ? [mediaId] : undefined });
      console.log('Tweet posted successfully!');
    } catch (error) {
      console.error('Error posting tweet:', error);
    }
  }


  // Schedule to post every 30 minutes
let postIndex = 0;
cron.schedule('*/30 * * * *', () => {
  const post = posts[postIndex];
  postTweet(post);

  // Move to the next post or reset to the start
  postIndex = (postIndex + 1) % posts.length;
});
  