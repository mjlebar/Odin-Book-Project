const User = require("./models/user");
const Post = require("./models/post");
const Comment = require("./models/comment");
const { faker } = require("@faker-js/faker");

async function populate() {
  // fills in the site by first creating random users, then making random friends, then making random posts, and finally adding random comments. Numbers here are arbitrary
  const totalUsers = await User.countDocuments({});
  //   we need this to generate a random number for our user
  await createRandomUsers(15);
  await makeRandomFriends(30, totalUsers);
  await makeRandomPosts(20, totalUsers);
  await addRandomComments(40, totalUsers);
  console.log("Seed done");
}

async function createRandomUsers(numUser) {
  for (let i = 0; i < numUser; i++) {
    const user = new User({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
      userName: faker.internet.email(),
      friends: [],
      friendRequests: [],
      sentRequests: [],
    });
    await User.create(user);
  }
  return;
}
//   creates a given number of new users

async function makeRandomFriends(numPairs, totalUsers) {
  //   we need this to generate a random number for our user
  for (let i = 0; i < numPairs; i++) {
    const randOne = Math.floor(Math.random() * totalUsers);
    const randTwo = Math.floor(Math.random() * totalUsers);
    // randomly query for two users
    if (randOne === randTwo) {
      // if we get the same user, run the loop again and decrement
      i--;

      continue;
    } else {
      const userOne = await User.findOne().skip(randOne);
      const userTwo = await User.findOne().skip(randTwo);
      if (userOne.friends.includes(userTwo._id)) {
        i--;
        continue;
        // if they're already friends, decrement the count by one and go again
      } else {
        // otherwise, make them friends!
        const newUserOne = new User({
          _id: userOne._id,
          userName: userOne.userName,
          firstName: userOne.firstName,
          lastName: userOne.lastName,
          password: userOne.password,
          friends: userOne.friends.concat([userTwo._id]),
          friendRequests: userOne.friendRequests,
          sentRequests: userOne.sentRequests,
        });
        const newUserTwo = new User({
          _id: userTwo._id,
          userName: userTwo.userName,
          firstName: userTwo.firstName,
          lastName: userTwo.lastName,
          password: userTwo.password,
          friends: userTwo.friends.concat([userOne._id]),
          friendRequests: userTwo.friendRequests,
          sentRequests: userTwo.sentRequests,
        });
        await Promise.all([
          User.findByIdAndUpdate(newUserOne._id, newUserOne, {}),
          User.findByIdAndUpdate(newUserTwo._id, newUserTwo, {}),
        ]);
      }
    }
  }
}

async function makeRandomPosts(numPost, totalUsers) {
  for (let i = 0; i < numPost; i++) {
    let randOne = Math.floor(Math.random() * totalUsers);
    const author = await User.findOne().skip(randOne);
    //   randomly generate an author for the post

    //   randomly fill in the likes on the post
    const likes = [];
    const randTwo = Math.floor(Math.random() * 15);
    // a random number up to 15 - this is how many likes there will be on the post. 15 is a totally arbitrary number here
    for (let i = 0; i < randTwo; i++) {
      const randThree = Math.floor(Math.random() * totalUsers);
      // random user to like the post
      const liker = await User.findOne().skip(randThree);
      likes.push(liker._id);
    }

    // make the post based on info above
    const post = new Post({
      content: faker.hacker.phrase(),
      author: author,
      likes: likes,
      comments: [],
    });
    await Post.create(post);
  }
}

async function addRandomComments(numComments, totalUsers) {
  for (let i = 0; i < numComments; i++) {
    const randOne = Math.floor(Math.random() * totalUsers);
    const author = await User.findOne().skip(randOne);
    //   randomly generate an author for the comment

    //   randomly fill in the likes on the comment
    const likes = [];
    const randTwo = Math.floor(Math.random() * 5);
    // a random number up to 15 - this is how many likes there will be on the post. 5 is a totally arbitrary number here
    for (let i = 0; i < randTwo; i++) {
      const randThree = Math.floor(Math.random() * totalUsers);
      // random user to like the post
      const liker = await User.findOne().skip(randThree);
      likes.push(liker._id);
    }

    const comment = new Comment({
      content: faker.hacker.phrase(),
      author: author,
      likes: likes,
    });

    const newComment = await Comment.create(comment);
    // create the comment

    const totalPosts = await Post.countDocuments({});

    let randFour = Math.floor(Math.random() * totalPosts);
    const post = await Post.findOne().skip(randFour);
    // query for a random post

    const newPost = new Post({
      content: post.content,
      author: post.author,
      likes: post.likes,
      comments: post.comments.concat([newComment._id]),
      _id: post._id,
    });
    // update the post to include the comment

    await Post.findByIdAndUpdate(newPost._id, newPost, {});
    // add the comment
  }
}

// followed this for random mongoose queries: https://stackoverflow.com/questions/39277670/how-to-find-random-record-in-mongoose

module.exports = populate;
