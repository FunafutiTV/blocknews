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

  describe("post", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
    });

    it("Should set the caller as the publication's poster", async() => {
      await expect(socialNetwork.connect(addr2).getPublicationPoster(1)).to.be.revertedWith('Publication with given ID does not exist');

      await socialNetwork.connect(addr1).post(1);
      const posterAfterPost = await socialNetwork.connect(addr2).getPublicationPoster(1);

      expect(posterAfterPost).to.equal(addr1.address);
    });

    it("Should revert if publication already exists", async() => {
      await socialNetwork.connect(addr1).post(1);

      await expect(socialNetwork.connect(addr2).post(1)).to.be.revertedWith("Publication with given ID already exists");
    });

    it("Should emit post event", async() => {
      await expect(socialNetwork.connect(addr1).post(1)).to.emit(socialNetwork, "NewPost").withArgs(1, addr1.address);
    })
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
        await socialNetwork.connect(addr1).post(1);
      });

      it("should decrease poster's profile score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);
        
        assert(scoreBeforeDownvote == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);

        assert(scoreAfterDownvote == -1);
      });

      it("should decrease poster's monthly profile score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeDownvote == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterDownvote == -1);
      });

      it("should decrease publication's score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getPublicationScore(1);
        
        assert(scoreBeforeDownvote == 0);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getPublicationScore(1);

        assert(scoreAfterDownvote == -1);
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
        await socialNetwork.connect(addr1).post(1);
        await socialNetwork.connect(addr2).downvote(1);
      });

      it("should increase poster's profile score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);
        
        assert(scoreBeforeDownvote == -1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);

        assert(scoreAfterDownvote == 0);
      });

      it("should increase poster's monthly profile score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeDownvote == -1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterDownvote == 0);
      });

      it("should increase publication's score by one", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getPublicationScore(1);
        
        assert(scoreBeforeDownvote == -1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getPublicationScore(1);

        assert(scoreAfterDownvote == 0);
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
        await socialNetwork.connect(addr1).post(1);
        await socialNetwork.connect(addr2).upvote(1);
      });

      it("should decrease poster's profile score by two", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);
        
        assert(scoreBeforeDownvote == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);

        assert(scoreAfterDownvote == -1);
      });

      it("should decrease poster's monthly profile score by two", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeDownvote == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterDownvote == -1);
      });

      it("should decrease publication's score by two", async() => {
        const scoreBeforeDownvote = await socialNetwork.connect(addr3).getPublicationScore(1);
        
        assert(scoreBeforeDownvote == 1);

        await socialNetwork.connect(addr2).downvote(1);
        const scoreAfterDownvote = await socialNetwork.connect(addr3).getPublicationScore(1);

        assert(scoreAfterDownvote == -1);
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
        await socialNetwork.connect(addr1).post(1);
      });

      it("should increase poster's profile score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);
        
        assert(scoreBeforeUpvote == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);

        assert(scoreAfterUpvote == 1);
      });

      it("should increase poster's monthly profile score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeUpvote == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterUpvote == 1);
      });

      it("should increase publication's score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getPublicationScore(1);
        
        assert(scoreBeforeUpvote == 0);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getPublicationScore(1);

        assert(scoreAfterUpvote == 1);
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
        await socialNetwork.connect(addr1).post(1);
        await socialNetwork.connect(addr2).upvote(1);
      });

      it("should decrease poster's profile score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);
        
        assert(scoreBeforeUpvote == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);

        assert(scoreAfterUpvote == 0);
      });

      it("should decrease poster's monthly profile score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeUpvote == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterUpvote == 0);
      });

      it("should decrease publication's score by one", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getPublicationScore(1);
        
        assert(scoreBeforeUpvote == 1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getPublicationScore(1);

        assert(scoreAfterUpvote == 0);
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
        await socialNetwork.connect(addr1).post(1);
        await socialNetwork.connect(addr2).downvote(1);
      });

      it("should increase poster's profile score by two", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);
        
        assert(scoreBeforeUpvote == -1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getProfileScore(addr1.address);

        assert(scoreAfterUpvote == 1);
      });

      it("should increase poster's monthly profile score by two", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);
        
        assert(scoreBeforeUpvote == -1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getMonthlyProfileScore(addr1.address, 202312);

        assert(scoreAfterUpvote == 1);
      });

      it("should increase publication's score by two", async() => {
        const scoreBeforeUpvote = await socialNetwork.connect(addr3).getPublicationScore(1);
        
        assert(scoreBeforeUpvote == -1);

        await socialNetwork.connect(addr2).upvote(1);
        const scoreAfterUpvote = await socialNetwork.connect(addr3).getPublicationScore(1);

        assert(scoreAfterUpvote == 1);
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
      await socialNetwork.connect(addr1).post(1);
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

  describe("rewardTopUsers", () => {
    let socialNetwork, owner, addr1, addr2, addr3;
    beforeEach(async() => {
      ({ socialNetwork, owner, addr1, addr2, addr3 } = await loadFixture(deployContract));
      await socialNetwork.connect(addr1).post(1);
      await socialNetwork.connect(addr1).upvote(1);
      await socialNetwork.connect(addr2).post(2);
      await socialNetwork.connect(addr1).upvote(2);
      await socialNetwork.connect(addr3).upvote(2);
      await socialNetwork.connect(addr3).post(3);
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

    // test event emission

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
    })
  })
})