const { loadFixture, } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

describe("SocialNetwork Tests", () => {
  async function deployContract() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const SocialNetwork = await ethers.getContractFactory("SocialNetwork");
    const socialNetwork = await SocialNetwork.deploy(SocialNetwork);
    return { socialNetwork, owner, addr1, addr2, addr3 };
  };

  describe("changeName", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if new name is longer than 24 characters", async() => {
      await expect(socialNetwork.connect(addr1).changeName("Dichlorodiphenyltrichloroethane")).to.be.revertedWith("Name must not be longer than 24 characters");
    });

    it("Should set user's name to new name", async() => {
      const userBeforeChange = await socialNetwork.connect(addr2).getUser(addr1.address);

      assert(userBeforeChange.name === "");

      await socialNetwork.connect(addr1).changeName("Name");
      const userAfterChange = await socialNetwork.connect(addr2).getUser(addr1.address);

      assert(userAfterChange.name == "Name");
    });

    it("Should emit name change event", async() => {
      await expect(socialNetwork.connect(addr1).changeName("Name")).to.emit(socialNetwork, "ChangedName").withArgs(addr1.address, "", "Name");
    });
  
  })

  describe("post", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if content string is empty", async() => {
      await expect(socialNetwork.connect(addr1).post("", 0)).to.be.revertedWith("Publication can't be empty");
    });

    it("Should revert if content string is longer than 300 characters", async() => {
      await expect(socialNetwork.connect(addr1).post("This post is longer than 300 characters IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII", 0)).to.be.revertedWith("Publications are limited to 300 characters");
    });

    it("Should revert if parent post doesn't exist", async() => {
      await expect(socialNetwork.connect(addr1).post("test", 1)).to.be.revertedWith("Parent post doesn't exist");
    });

    it("Should create publication", async() => {
      await socialNetwork.connect(addr1).post("test", 0);
      await socialNetwork.connect(addr2).post("comment", 1);
      const publication = await socialNetwork.connect(addr3).getPublication(2);

      assert(publication.exists);
      assert(publication.id == 2);
      assert(publication.poster === addr2.address);
      assert(publication.content === "comment");
      assert(publication.isCommentOfID == 1);
    });

    it("Should increment ID for next publication", async() => {
      expect(await socialNetwork.connect(addr2).nextUnusedPublicationID()).to.equal(1);

      await socialNetwork.connect(addr1).post("test", 0);

      expect(await socialNetwork.connect(addr2).nextUnusedPublicationID()).to.equal(2);
    })

    it("Should push publication's ID in poster's posts array", async() => {
      const posterBeforePost = await socialNetwork.connect(addr2).getUser(addr1.address);

      assert(posterBeforePost.postsIDs.length === 0);

      await socialNetwork.connect(addr1).post("test", 0);
      const posterAfterPost = await socialNetwork.connect(addr2).getUser(addr1.address);

      assert(posterAfterPost.postsIDs.length === 1);
    });

    it("Should push publication's ID in parent post's comments array", async() => {
      await socialNetwork.connect(addr1).post("test", 0);
      const parentPostBeforeComment = await socialNetwork.connect(addr3).getPublication(1);

      assert(parentPostBeforeComment.commentsIDs.length === 0);

      await socialNetwork.connect(addr2).post("comment", 1);
      const parentPostAfterComment = await socialNetwork.connect(addr2).getPublication(1);

      assert(parentPostAfterComment.commentsIDs.length === 1);
    });

    it("Should emit post event", async() => {
      await expect(socialNetwork.connect(addr1).post("test", 0)).to.emit(socialNetwork, "NewPost").withArgs(1, addr1.address);
    });
  });

  describe("downvote", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if publication doesn't exist", async() => {
      await expect(socialNetwork.connect(addr1).downvote(1)).to.be.revertedWith("Publication with given ID does not exist");
    });

    describe("if user hasn't upvoted nor downvoted this post yet", () => {
      beforeEach(async() => {
        await socialNetwork.connect(addr1).post("first post", 0);
      });

      it("should decrease poster's profile score by one", async() => {
        const userBeforeDownvote = await socialNetwork.connect(addr3).getUser(addr1.address);
        
        assert(userBeforeDownvote.score == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const userAfterDownvote = await socialNetwork.connect(addr3).getUser(addr1.address);

        assert(userAfterDownvote.score == -1);
      });

      it("should decrease poster's monthly profile score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeDownvote == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterDownvote == -1);
      });

      it("should decrease publication's score by one", async() => {
        const postBeforeDownvote = await socialNetwork.connect(addr3).getPublication(1);
        
        assert(postBeforeDownvote.score == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const postAfterDownvote = await socialNetwork.connect(addr3).getPublication(1);

        assert(postAfterDownvote.score == -1);
      });

      it("should register user's vote", async() => {
        const hasVotedBeforeDownvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);
        
        assert(hasVotedBeforeDownvote == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const hasVotedAfterDownvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);

        assert(hasVotedAfterDownvote == 1);
      });

      it("should emit downvote event", async() => {
        await expect(socialNetwork.connect(addr2).downvote(1)).to.emit(socialNetwork, "Downvoted").withArgs(addr2.address, 1);
      });
    });

    describe("if user has already downvoted this post", () => {
      beforeEach(async() => {
        await socialNetwork.connect(addr1).post("first post", 0);
        await socialNetwork.connect(addr2).downvote(1);
      });

      it("should increase poster's profile score by one", async() => {
        const userBeforeDownvote = await socialNetwork.connect(addr3).getUser(addr1.address);
        
        assert(userBeforeDownvote.score == -1);

        await socialNetwork.connect(addr2).downvote(1);
        const userAfterDownvote = await socialNetwork.connect(addr3).getUser(addr1.address);

        assert(userAfterDownvote.score == 0);
      });

      it("should increase poster's monthly profile score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeDownvote == -1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterDownvote == 0);
      });

      it("should increase publication's score by one", async() => {
        const postBeforeDownvote = await socialNetwork.connect(addr3).getPublication(1);
        
        assert(postBeforeDownvote.score == -1);

        await socialNetwork.connect(addr2).downvote(1);
        const postAfterDownvote = await socialNetwork.connect(addr3).getPublication(1);

        assert(postAfterDownvote.score == 0);
      });

      it("should register that user has not voted", async() => {
        const hasVotedBeforeDownvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);
        
        assert(hasVotedBeforeDownvote == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const hasVotedAfterDownvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);

        assert(hasVotedAfterDownvote == 0);
      });

      it("should emit downvote removal event", async() => {
        await expect(socialNetwork.connect(addr2).downvote(1)).to.emit(socialNetwork, "RemovedDownvote").withArgs(addr2.address, 1);
      });
    });

    describe("if user has already upvoted this post", () => {
      beforeEach(async() => {
        await socialNetwork.connect(addr1).post("first post", 0);
        await socialNetwork.connect(addr2).upvote(1);
      });

      it("should decrease poster's profile score by two", async() => {
        const userBeforeDownvote = await socialNetwork.connect(addr3).getUser(addr1.address);
        
        assert(userBeforeDownvote.score == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const userAfterDownvote = await socialNetwork.connect(addr3).getUser(addr1.address);

        assert(userAfterDownvote.score == -1);
      });

      it("should decrease poster's monthly profile score by two", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeDownvote == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterDownvote == -1);
      });

      it("should decrease publication's score by two", async() => {
        const postBeforeDownvote = await socialNetwork.connect(addr3).getPublication(1);
        
        assert(postBeforeDownvote.score == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const postAfterDownvote = await socialNetwork.connect(addr3).getPublication(1);

        assert(postAfterDownvote.score == -1);
      });

      it("should register user's vote", async() => {
        const hasVotedBeforeDownvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);
        
        assert(hasVotedBeforeDownvote == 2);

        await socialNetwork.connect(addr2).downvote(1);
        const hasVotedAfterDownvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);

        assert(hasVotedAfterDownvote == 1);
      });

      it("should emit upvote removal event", async() => {
        await expect(socialNetwork.connect(addr2).downvote(1)).to.emit(socialNetwork, "RemovedUpvote").withArgs(addr2.address, 1);
      });

      it("should emit downvote event", async() => {
        await expect(socialNetwork.connect(addr2).downvote(1)).to.emit(socialNetwork, "Downvoted").withArgs(addr2.address, 1);
      });
    });
  });

  describe("upvote", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if publication doesn't exist", async() => {
      await expect(socialNetwork.connect(addr1).upvote(1)).to.be.revertedWith("Publication with given ID does not exist");
    });

    describe("if user hasn't upvoted nor downvoted this post yet", () => {
      beforeEach(async() => {
        await socialNetwork.connect(addr1).post("first post", 0);
      });

      it("should increase poster's profile score by one", async() => {
        const userBeforeUpvote = await socialNetwork.connect(addr3).getUser(addr1.address);
        
        assert(userBeforeUpvote.score == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const userAfterUpvote = await socialNetwork.connect(addr3).getUser(addr1.address);

        assert(userAfterUpvote.score == 1);
      });

      it("should increase poster's monthly profile score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeUpvote == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterUpvote == 1);
      });

      it("should increase publication's score by one", async() => {
        const postBeforeUpvote = await socialNetwork.connect(addr3).getPublication(1);
        
        assert(postBeforeUpvote.score == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const postAfterUpvote = await socialNetwork.connect(addr3).getPublication(1);

        assert(postAfterUpvote.score == 1);
      });

      it("should register user's vote", async() => {
        const hasVotedBeforeUpvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);
        
        assert(hasVotedBeforeUpvote == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const hasVotedAfterUpvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);

        assert(hasVotedAfterUpvote == 2);
      });

      it("should emit upvote event", async() => {
        await expect(socialNetwork.connect(addr2).upvote(1)).to.emit(socialNetwork, "Upvoted").withArgs(addr2.address, 1);
      });
    });

    describe("if user has already upvoted this post", () => {
      beforeEach(async() => {
        await socialNetwork.connect(addr1).post("first post", 0);
        await socialNetwork.connect(addr2).upvote(1);
      });

      it("should decrease poster's profile score by one", async() => {
        const userBeforeUpvote = await socialNetwork.connect(addr3).getUser(addr1.address);
        
        assert(userBeforeUpvote.score == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const userAfterUpvote = await socialNetwork.connect(addr3).getUser(addr1.address);

        assert(userAfterUpvote.score == 0);
      });

      it("should decrease poster's monthly profile score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeUpvote == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterUpvote == 0);
      });

      it("should decrease publication's score by one", async() => {
        const postBeforeUpvote = await socialNetwork.connect(addr3).getPublication(1);
        
        assert(postBeforeUpvote.score == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const postAfterUpvote = await socialNetwork.connect(addr3).getPublication(1);

        assert(postAfterUpvote.score == 0);
      });

      it("should register that user has not voted", async() => {
        const hasVotedBeforeUpvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);
        
        assert(hasVotedBeforeUpvote == 2);

        await socialNetwork.connect(addr2).upvote(1);
        const hasVotedAfterUpvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);

        assert(hasVotedAfterUpvote == 0);
      });

      it("should emit upvote removal event", async() => {
        await expect(socialNetwork.connect(addr2).upvote(1)).to.emit(socialNetwork, "RemovedUpvote").withArgs(addr2.address, 1);
      });
    });

    describe("if user has already downvoted this post", () => {
      beforeEach(async() => {
        await socialNetwork.connect(addr1).post("first post", 0);
        await socialNetwork.connect(addr2).downvote(1);
      });

      it("should increase poster's profile score by two", async() => {
        const userBeforeUpvote = await socialNetwork.connect(addr3).getUser(addr1.address);
        
        assert(userBeforeUpvote.score == -1);

        await socialNetwork.connect(addr2).upvote(1);
        const userAfterUpvote = await socialNetwork.connect(addr3).getUser(addr1.address);

        assert(userAfterUpvote.score == 1);
      });

      it("should increase poster's monthly profile score by two", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeUpvote == -1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterUpvote == 1);
      });

      it("should increase publication's score by two", async() => {
        const postBeforeUpvote = await socialNetwork.connect(addr3).getPublication(1);
        
        assert(postBeforeUpvote.score == -1);

        await socialNetwork.connect(addr2).upvote(1);
        const postAfterUpvote = await socialNetwork.connect(addr3).getPublication(1);

        assert(postAfterUpvote.score == 1);
      });

      it("should register user's vote", async() => {
        const hasVotedBeforeUpvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);
        
        assert(hasVotedBeforeUpvote == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const hasVotedAfterUpvote = await socialNetwork.connect(addr3).upvoteOrDownvote(addr2.address, 1);

        assert(hasVotedAfterUpvote == 2);
      });

      it("should emit downvote removal event", async() => {
        await expect(socialNetwork.connect(addr2).upvote(1)).to.emit(socialNetwork, "RemovedDownvote").withArgs(addr2.address, 1);
      });

      it("should emit upvote event", async() => {
        await expect(socialNetwork.connect(addr2).upvote(1)).to.emit(socialNetwork, "Upvoted").withArgs(addr2.address, 1);
      });
    });
  });

  describe("setNewTopUsers", () => { // Because it is a private function, it will be tested by calling downvote() or upvote(), which (unless it reverts) always execute setNewTopUsers()
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
      await socialNetwork.connect(addr1).post("first post", 0);
    });

    it("Should take an empty spot (address 0) in array if it has a positive score", async() => {
      await expect(socialNetwork.connect(addr2).upvote(1)).to.emit(socialNetwork, "NewTopUser").withArgs(addr1.address, "0x0000000000000000000000000000000000000000");
    });

    it("Should not change array if it has a score of 0 or less", async() => {
      await expect(socialNetwork.connect(addr2).downvote(1)).not.to.emit(socialNetwork, "NewTopUser");
    });

    it("Should not change array if it is already in the array but has a positive score", async() => {
      await socialNetwork.connect(addr2).upvote(1);

      await expect(socialNetwork.connect(addr3).upvote(1)).not.to.emit(socialNetwork, "NewTopUser");
    });

    it("Should be replaced by address 0 if it is already in array but has a score of 0 or less", async() => {
      await socialNetwork.connect(addr2).upvote(1);

      await expect(socialNetwork.connect(addr3).downvote(1)).to.emit(socialNetwork, "NewTopUser").withArgs("0x0000000000000000000000000000000000000000", addr1.address);
    });
  });

  describe("follow", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if the user tries to follow themselves", async () => {
      await expect(socialNetwork.connect(addr1).follow(addr1.address)).to.be.revertedWith("You can't follow yourself");
    });

    it("Should revert if the user already follows the address", async() => {
      await socialNetwork.connect(addr1).follow(addr2.address);
      
      await expect(socialNetwork.connect(addr1).follow(addr2.address)).to.be.revertedWith("You already follow this user");
    });

    it("Should register follow", async () => {
      const followBeforeFollow = await socialNetwork.connect(addr3).doesFollow(addr1.address, addr2.address);

      assert(!followBeforeFollow);

      await socialNetwork.connect(addr1).follow(addr2.address);
      const followAfterFollow = await socialNetwork.connect(addr3).doesFollow(addr1.address, addr2.address);

      assert(followAfterFollow);
    });

    it("Should add new user in follower's followings list", async () => {
      const userBeforeFollow = await socialNetwork.connect(addr3).getUser(addr1.address);

      assert(userBeforeFollow.followingsList.followList.length === 0);
      assert(userBeforeFollow.followingsList.number == 0);

      await socialNetwork.connect(addr1).follow(addr2.address);
      const userAfterFollow = await socialNetwork.connect(addr3).getUser(addr1.address);

      assert(userAfterFollow.followingsList.followList.length === 1);
      assert(userAfterFollow.followingsList.number == 1);
    });

    it("Should add new user in followed's followers list", async () => {
      const userBeforeFollow = await socialNetwork.connect(addr3).getUser(addr2.address);

      assert(userBeforeFollow.followersList.followList.length === 0);
      assert(userBeforeFollow.followersList.number == 0);

      await socialNetwork.connect(addr1).follow(addr2.address);
      const userAfterFollow = await socialNetwork.connect(addr3).getUser(addr2.address);

      assert(userAfterFollow.followersList.followList.length === 1);
      assert(userAfterFollow.followersList.number == 1);
    });

    it("Should emit follow event", async() => {
      await expect(socialNetwork.connect(addr1).follow(addr2.address)).to.emit(socialNetwork, "Followed").withArgs(addr1.address, addr2.address);
    });
  });

  describe("unfollow", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if the user tries to unfollow themselves", async () => {
      await expect(socialNetwork.connect(addr1).unfollow(addr1.address)).to.be.revertedWith("You can't unfollow yourself");
    });

    it("Should revert if the user doesn't follow the address", async() => {
      await expect(socialNetwork.connect(addr1).unfollow(addr2.address)).to.be.revertedWith("You don't follow this user");
    });

    it("Should register follow", async () => {
      await socialNetwork.connect(addr1).follow(addr2.address);
      const followBeforeUnfollow = await socialNetwork.connect(addr3).doesFollow(addr1.address, addr2.address);

      assert(followBeforeUnfollow);

      await socialNetwork.connect(addr1).unfollow(addr2.address);
      const followAfterUnfollow = await socialNetwork.connect(addr3).doesFollow(addr1.address, addr2.address);

      assert(!followAfterUnfollow);
    });

    it("Should replace user by address 0 in follower's followings list", async () => {
      await socialNetwork.connect(addr1).follow(addr2.address);
      const userBeforeUnfollow = await socialNetwork.connect(addr3).getUser(addr1.address);

      assert(userBeforeUnfollow.followingsList.followList[0] === addr2.address);
      assert(userBeforeUnfollow.followingsList.number == 1);

      await socialNetwork.connect(addr1).unfollow(addr2.address);
      const userAfterUnfollow = await socialNetwork.connect(addr3).getUser(addr1.address);

      assert(userAfterUnfollow.followingsList.followList[0] === "0x0000000000000000000000000000000000000000");
      assert(userAfterUnfollow.followingsList.number == 0);
    });

    it("Should replace user by address 0 in followed's followers list", async () => {
      await socialNetwork.connect(addr1).follow(addr2.address);
      const userBeforeUnfollow = await socialNetwork.connect(addr3).getUser(addr2.address);

      assert(userBeforeUnfollow.followersList.followList[0] === addr1.address);
      assert(userBeforeUnfollow.followersList.number == 1);

      await socialNetwork.connect(addr1).unfollow(addr2.address);
      const userAfterUnfollow = await socialNetwork.connect(addr3).getUser(addr2.address);

      assert(userAfterUnfollow.followersList.followList[0] === "0x0000000000000000000000000000000000000000");
      assert(userAfterUnfollow.followersList.number == 0);
    });

    it("Should emit unfollow event", async() => {
      await socialNetwork.connect(addr1).follow(addr2.address);

      await expect(socialNetwork.connect(addr1).unfollow(addr2.address)).to.emit(socialNetwork, "Unfollowed").withArgs(addr1.address, addr2.address);
    });
  });

  describe("rewardTopUsers", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
      await socialNetwork.connect(addr1).post("first post", 0);
      await socialNetwork.connect(addr1).upvote(1);
      await socialNetwork.connect(addr2).post("second post", 0);
      await socialNetwork.connect(addr1).upvote(2);
      await socialNetwork.connect(addr3).upvote(2);
      await socialNetwork.connect(addr3).post("reply to second post", 2);
      await socialNetwork.connect(addr2).downvote(3);
    });

    it("Should revert if not called by the owner", async() => {
      await expect(socialNetwork.connect(addr1).rewardTopUsers()).to.be.revertedWithCustomError(socialNetwork, "OwnableUnauthorizedAccount");
    });

    it("Should give an SFT to the top users", async() => {
      expect(await socialNetwork.connect(addr3).hasBeenRewarded(addr1.address, 202312)).to.equal(false);
      expect(await socialNetwork.connect(addr3).hasBeenRewarded(addr2.address, 202312)).to.equal(false);

      await socialNetwork.connect(owner).rewardTopUsers();

      expect(await socialNetwork.connect(addr3).hasBeenRewarded(addr1.address, 202312)).to.equal(true);
      expect(await socialNetwork.connect(addr3).hasBeenRewarded(addr2.address, 202312)).to.equal(true);
    });

    it("Should not give an SFT to an user that is not a top user", async () => {
      expect(await socialNetwork.connect(addr1).hasBeenRewarded(addr3.address, 202312)).to.equal(false);

      await socialNetwork.connect(owner).rewardTopUsers();

      expect(await socialNetwork.connect(addr1).hasBeenRewarded(addr3.address, 202312)).to.equal(false);
    });

    it("Should not give an SFT to address 0", async () => {
      expect(await socialNetwork.connect(addr1).hasBeenRewarded("0x0000000000000000000000000000000000000000", 202312)).to.equal(false);

      await socialNetwork.connect(owner).rewardTopUsers();

      expect(await socialNetwork.connect(addr1).hasBeenRewarded("0x0000000000000000000000000000000000000000", 202312)).to.equal(false);
    });

    it("Should push SFT ID to user's SFT array", async() => {
      const userBeforeReward = await socialNetwork.connect(addr1).getUser(addr2.address);

      assert (userBeforeReward.SFTIDs.length === 0);

      await socialNetwork.connect(owner).rewardTopUsers();
      const userAfterReward = await socialNetwork.connect(addr1).getUser(addr2.address);

      assert (userAfterReward.SFTIDs.length === 1);
    });

    it("Should increase month by 89 if it is December", async () => {
      const monthBeforeCall = await socialNetwork.connect(addr1).month();

      assert(monthBeforeCall == BigInt(202312));

      await socialNetwork.connect(owner).rewardTopUsers();
      const monthAfterCall = await socialNetwork.connect(addr1).month();

      assert(monthAfterCall == monthBeforeCall + BigInt(89));
    });

    it("Should increase month by one if it is not December", async() => {
      await socialNetwork.connect(owner).rewardTopUsers();
      const monthBeforeCall = await socialNetwork.connect(addr1).month();

      assert(monthBeforeCall == BigInt(202401));

      await socialNetwork.connect(owner).rewardTopUsers();
      const monthAfterCall = await socialNetwork.connect(addr1).month();

      assert(monthAfterCall == monthBeforeCall + BigInt(1));
    })

  });

})

describe("TopUsersSFT Tests", () => {
  async function deployContract() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const TopUsersSFT = await ethers.getContractFactory("TopUsersSFT");
    const topUsersSFT = await TopUsersSFT.deploy(TopUsersSFT);
    return { topUsersSFT, owner, addr1, addr2, addr3 };
  };

  describe("mintOne", () => {
    let topUsersSFT, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ topUsersSFT, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should revert if not called by the owner", async () => {
      await expect(topUsersSFT.connect(addr1).mintOne(addr1.address, 202312)).to.be.revertedWithCustomError(topUsersSFT, "OwnableUnauthorizedAccount");
    });

    it("Should revert if given address 0", async () => {
      await expect(topUsersSFT.connect(owner).mintOne("0x0000000000000000000000000000000000000000", 202312)).to.be.revertedWith("Invalid address");
    });

    it("Should revert if ID doesn't correspond to a month between December 2023 and December 2026", async () => {
      await expect(topUsersSFT.connect(owner).mintOne(addr1.address, 202311)).to.be.revertedWith("Invalid ID");
      await expect(topUsersSFT.connect(owner).mintOne(addr1.address, 202313)).to.be.revertedWith("Invalid ID");
      await expect(topUsersSFT.connect(owner).mintOne(addr1.address, 202400)).to.be.revertedWith("Invalid ID");
      await expect(topUsersSFT.connect(owner).mintOne(addr1.address, 202701)).to.be.revertedWith("Invalid ID");
    });

    it("Should mint one SFT with given ID", async () => {
      const SFTBalanceBeforeMint = await topUsersSFT.connect(addr2).balanceOf(addr1.address, 202401);

      assert(SFTBalanceBeforeMint == 0);

      await topUsersSFT.connect(owner).mintOne(addr1.address, 202401);
      const SFTBalanceAfterMint = await topUsersSFT.connect(addr2).balanceOf(addr1.address, 202401);

      assert(SFTBalanceAfterMint == 1);
    });

    it("Should emit mint event", async () => {
      await expect(topUsersSFT.connect(owner).mintOne(addr1.address, 202312)).to.emit(topUsersSFT, "Minted").withArgs(addr1.address, 202312);
    });
  })
})