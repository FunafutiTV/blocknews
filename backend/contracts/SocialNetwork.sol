// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TopUsersSFT.sol";

/// @title A social network contract
/// @author Nathanael Kubski
/// @notice You can use this contract to implement a very basic social network using the blockchain technology
/** 
 * @dev 
 * This contract is using OpenZeppelin's Ownable contract, which means that the address deploying the contract
 * will be the contract's "owner".
 * Only the owner will be able to reward the top users.
 *
 * This contract deploys an instance of the TopUsersSFT contract.
 *
 * This contract only cover a limited number of social network interactions.
 */ 
contract SocialNetwork is Ownable {

    /// @dev This enum is used to determine if a user has downvoted, upvoted or not voted on a post
    enum Vote { NoVote, Downvote, Upvote }

    /** 
     * @dev
     * This structure will be used in a mapping to match with the post's ID
     * The content string contains the text of the post
     * The link string contains the link of the source
     * The date uint contains the timestamp of the publication of the post
     * If the post has a parent post, its ID is the isCommentOfID uint
     * If it is a repost, the ID of the original post is in the isRepostOf uint
     * Each comments will be pushed in the commentsIDs array
     */
    struct Post {
        bool exists;
        uint id;
        address poster;
        uint isRepostOf;
        string content;
        uint isCommentOfID;
        int score;
        uint[] commentsIDs;
        uint date;
        string link;
        uint category;
    }

    /** 
     * @dev
     * This structure will be used in a mapping to match with the post's ID
     * The content string contains the text of the post
     * If the post has a parent post, its ID is the isCommentOfID uint
     * Each comments will be pushed in the commentsIDs array
     */
    struct Follow {
        bool follows;
        uint positionInFollowingsArray;
    }

    /** 
     * @dev
     * This structure will be used to store the followings list of a user
     * followList contains the actual array while number contains the number of followings
     * followList.length wouldn't work to get number because when the unfollow function is called, the unfollowed 
     * user's address in replaced by an address 0 which we don't want to count as a following
     */
    struct FollowList {
        address[] followList;
        uint number;
    }

    /** 
     * @dev
     * This structure will be used in a mapping to match with the user's address
     * The name and description strings are empty by default but they can be updated using functions
     * The lastPostsIDs array contains the 25 last posts of the user
     * The positionInPostsArray uint is used to write each new post in the array
     * Each new post will be written in the lastPostsIDs array, at the position of positionInPostsArray
     * If the user is rewarded an SFT, it will be pushed in the SFTIDs array
     */
    struct User {
        string name;
        int score;
        string description;
        uint picture;
        FollowList followingsList;
        uint numberOfFollowers;
        uint[25] lastPostsIDs;
        uint positionInPostsArray;
        uint[] SFTIDs;
    }

    /** 
     * @dev
     * This structure will be used in a mapping to match with the category's number
     * The lastPosts array contains the 40 last posts of the category
     * The positionInArray uint is used to write each new post in the array
     */
    struct Category {
        uint[40] lastPosts;
        uint positionInArray;
    }

    /// @dev This mapping links every uint (month) to a score (can be negative) for each address
    mapping (uint => mapping (address => int)) monthlyProfileScore;

    /// @dev This mapping links every address to a Vote enum for each posts ID
    mapping (address => mapping (uint => Vote)) hasVoted;

    /// @dev This mapping links every posts ID to a Post struct
    mapping (uint => Post) postByID;

    /// @dev This mapping links address to a Follow struct for each address
    mapping (address => mapping (address => Follow)) follows;

    /// @dev This mapping links every address to a User struct
    mapping (address => User) userByAddress;

    /// @dev This mapping links every uint to a category struct
    mapping (uint => Category) category;
    
    /** 
     * @dev
     * This mapping will be updated in the setNewTopUsers function and contains the 10 users with the highest
     * score for the current month
     */
    address[10] topUsers;

    /// @notice This variable contains the current month (first 4 digits = year, 2 last digits = month)
    /// @dev This variable will be incremented every time rewardTopUsers is called
    uint public month = 202404;

    /// @notice This variable contains the ID that will be taken by the next post
    /// @dev This variable is incremented every time post is called
    uint public nextUnusedPublicationID = 1;

    /** 
     * @dev
     * This is the number of categories used in the app, stored in a constant
     * It could be modified in future versions without having to change anything else in the contract
     */
    uint numberOfCategories = 4;

    /** 
     * @dev
     * This is the number of profile pictures available in the app, stored in a constant
     * It could be modified in future versions without having to change anything else in the contract
     */
    uint numberOfPictures = 20;
    
    /// @dev This is an instance of the TopUsersSFT contract that will be used in rewardTopUsers
    TopUsersSFT topUsersSFT = new TopUsersSFT();

    /// @notice This event will be emitted every time a new post is created
    /// @dev This event will be emitted every time the post function is executed
    /// @param publicationID The ID of the new post
    /// @param poster The address of the poster
    event NewPost(uint publicationID, address poster);

    /// @notice This event will be emitted every time a repost is made
    /// @dev This event will be emitted every time the repost function is executed
    /// @param reposter The address of the poster
    /// @param repostedPublicationID The ID of the original post
    /// @param repostPublicationID The ID of the new post
    event Reposted(address reposter, uint repostedPublicationID, uint repostPublicationID);

    /// @notice This event will be emitted every time a post is upvoted
    /// @dev This event can be emitted when the upvote function is executed
    /// @param voter The address of the user upvoting
    /// @param publicationID The ID of the upvoted post
    event Upvoted(address voter, uint publicationID);

    /// @notice This event will be emitted every time an upvote is removed
    /// @dev This event can be emitted in some cases when downvote or upvote are called
    /// @param voter The address of the user removing the upvote
    /// @param publicationID The ID of the upvoted post
    event RemovedUpvote(address voter, uint publicationID);

    /// @notice This event will be emitted every time a post is downvoted
    /// @dev This event can be emitted when the downvote function is executed
    /// @param voter The address of the user downvoting
    /// @param publicationID The ID of the downvoted post
    event Downvoted(address voter, uint publicationID);

    /// @notice This event will be emitted every time a downvote is removed
    /// @dev This event can be emitted in some cases when downvote or upvote are called
    /// @param voter The address of the user removing the downvote
    /// @param publicationID The ID of the downvoted post
    event RemovedDownvote(address voter, uint publicationID);

    /// @notice This event will be emitted every time a user changes their name
    /// @dev This event will be emitted everytime the changeName function is executed
    /// @param user The address of the user that changes their name
    /// @param previousName The previous name of the user
    /// @param previousName The new name of the user
    event ChangedName(address user, string previousName, string newName);

    /// @notice This event will be emitted every time a user changes their description
    /// @dev This event will be emitted everytime the changeDescription function is executed
    /// @param user The address of the user that changes their name
    /// @param timestamp The timestamp of when the function was called
    event ChangedDescription(address user, uint timestamp);

    /// @notice This event will be emitted every time a user changes their profile picture
    /// @dev This event will be emitted everytime the changePicture function is executed
    /// @param user The address of the user that changes their picture
    /// @param previousPicture The ID of the previous picture
    /// @param newPicture The ID of the new picture
    event ChangedPicture(address user, uint previousPicture, uint newPicture);

    /// @notice This event might be emitted when a user upvotes or downvotes a post
    /// @dev This event will be emitted every time the topUsers array is modified
    /// @param newTopUser The address of the user entering the array
    /// @param previousTopUser The address of the user removed from the array
    event NewTopUser(address newTopUser, address previousTopUser);

    /// @notice This event will be emitted every time a user follow another user
    /// @dev This event is emitted every time the follow function is executed
    /// @param follower The address of the user following
    /// @param followed The address of the user followed
    event Followed(address follower, address followed);

    /// @notice This event will be emitted every time a user unfollow another user
    /// @dev This event is emitted every time the unfollow function is executed
    /// @param follower The address of the user unfollowing
    /// @param followed The address of the user unfollowed
    event Unfollowed(address follower, address followed);

    constructor() Ownable(msg.sender) {}

    /// @dev This modifier will revert the function if the post with given ID doesn't exist
    modifier publicationExists(uint _publicationID) {
        require(postByID[_publicationID].exists, "Publication with given ID does not exist");
        _;
    }

    /// @param _user The address of the user for whom the profile score is queried
    /// @param _month The month for which the profile score is retrieved (first 4 digits = year, 2 last = month)
    /// @return int The profile score of the specified user for the given month
    /** 
     * @dev
     * This function uses the monthlyProfileScore mapping
     * _month can't be higher than the current month (in the future)
     */
    function getMonthlyProfileScore(address _user, uint _month) external view returns (int) {
        require(_month <= month, "Given month is in the future");
        return monthlyProfileScore[_month][_user];
    }

    /// @param _user The address of the user for whom the follow status is queried
    /// @param _target The address of the user for whom we want to know if they are followed by _user
    /// @return bool Whether or not _user follow _target
    /// @dev This function uses the follows mapping
    function doesFollow(address _user, address _target) external view returns (bool) {
        return follows[_user][_target].follows;
    }

    /// @return address[10] An array containing the addresses of the 10 top users
    /// @dev This function retuens the topUsers array
    function getTopUsers() external view returns (address[10] memory) {
        return topUsers;
    }

    /// @param _publicationID The ID of the publication
    /// @return Post The Post struct of the publication
    /// @dev This function uses the postByID mapping, and reverts if the publication doesn't exist
    function getPublication(uint _publicationID) external publicationExists(_publicationID) view returns (Post memory) {
        return postByID[_publicationID];
    }

    /// @param _user The address of the user
    /// @return User The User struct of the publication
    /// @dev This function uses the userByAddress mapping, and reverts if _user is the 0 address
    function getUser(address _user) external view returns (User memory) {
        require (_user != address(0), "User with address 0 does not exist");
        return userByAddress[_user];
    }

    /// @param _category The ID of the category
    /// @return uint[40] An array containing the IDs of the 40 most recent posts of this category
    /// @dev This function uses the category mapping, and reverts if _category is bigger than numberOfCategories
    function getLastPostsFromCategory(uint _category) external view returns (uint[40] memory) {
        require(_category <= numberOfCategories, "This category does not exist");
        return category[_category].lastPosts;
    }

    /// @param _user The address of the queried user
    /// @param _month The month of the queried SFT (also the ID of the SFT)
    /// @return bool Whether or not _user owns an SFT with ID _month
    /** 
     * @dev
     * This function queries the topUsersSFT contract using the balanceOf function of ERC1155
     * This function will revert if the user has more than one SFT with given ID
     */
    function hasBeenRewarded(address _user, uint _month) public view returns (bool) {
        uint SFTnumber = topUsersSFT.balanceOf(_user, _month);
        require(SFTnumber < 2, "Error. The user shouldn't have more than one SFT for a month.");
        if (SFTnumber == 1) return true;
        else return false;
    }

    /// @return string The IPFS URI of the SFT
    /** 
     * @dev
     * This function queries the topUsersSFT contract using the uri function of ERC1155
     * The 202404 parameter is arbitrary because the same URI is returned no matter the parameter
     */
    function getSFTURI() external view returns (string memory) {
        return topUsersSFT.uri(202404);
    }

    function upvoteOrDownvote(address _user, uint _publicationID) public publicationExists(_publicationID) view returns (uint) {
        if (hasVoted[_user][_publicationID] == Vote.Downvote) {
            return 1;
        } else if (hasVoted[_user][_publicationID] == Vote.Upvote) {
            return 2;
        } else {
            return 0;
        }
    }

    /// @param _user The address of the user whose score needs is evaluated
    /** 
     * @dev
     * This function checks the user's score against the existing top users' scores
     * This function may or may not update topUsersSFT based on the score of _user
     * This function emits 'NewTopUser' if _user joins or leaves the topUsers array
     */
    function setNewTopUsers(address _user) private {
        uint lowestScorePosition;
        int lowestScore = monthlyProfileScore[month][topUsers[0]];
        bool isInArray;
        if (monthlyProfileScore[month][_user] <= 0) {
            for(uint i = 0; i < topUsers.length; i++) {
                if (topUsers[i] == _user) {
                    topUsers[i] = address(0);
                    emit NewTopUser(address(0), _user);
                    break;
                }
            }
        } else {
            for(uint i = 0; i < topUsers.length; i++) {
                if (topUsers[i] == _user) {
                    isInArray = true;
                    break;
                }
                if (monthlyProfileScore[month][topUsers[i]] < lowestScore) {
                    lowestScorePosition = i;
                    lowestScore = monthlyProfileScore[month][topUsers[i]];
                }
            }
            if (!isInArray && monthlyProfileScore[month][_user] > lowestScore) {
                address previousTopUser = topUsers[lowestScorePosition];
                topUsers[lowestScorePosition] = _user;
                emit NewTopUser(_user, previousTopUser);
            }
        }
    }

    /// @notice This function changes the name of the user calling it
    /// @param _newName The new name to be assigned to the user.
    /** 
     * @dev
     * This function changes the name of the user to the provided new name, given it doesn't exceed 24 characters
     * This function emits the ChangedName event
     */
    function changeName(string calldata _newName) external {
        require(bytes(_newName).length <= 24, "Name must not be longer than 24 characters");
        string memory previousName = userByAddress[msg.sender].name;
        userByAddress[msg.sender].name = _newName;
        emit ChangedName(msg.sender, previousName, _newName);
    }

    /// @notice This function changes the description of the user calling it
    /// @param _newDescription The new description to be assigned to the user.
    /** 
     * @dev
     * This function changes the description of the user to the given string, given it doesn't exceed 300 characters
     * This function emits the ChangedDescription event
     */
    function changeDescription(string calldata _newDescription) external {
        require(bytes(_newDescription).length <= 300, "Description must not be longer than 300 characters");
        userByAddress[msg.sender].description = _newDescription;
        emit ChangedDescription(msg.sender, block.timestamp);
    }

    /// @notice This function changes the profile picture of the user calling it
    /// @param _newPicture The ID of the new picture
    /** 
     * @dev
     * This function changes the profile picture of the user to the given ID
     * This function will revert if _newPicture is bigger than numberOfPictures
     * The ID is given to the frontend, which will use it to get the actual picture
     * This function emits the ChangedPicture event
     */
    function changePicture(uint _newPicture) external {
        require(_newPicture <= numberOfPictures, "Picture with given number does not exist");
        uint previousPicture = userByAddress[msg.sender].picture;
        userByAddress[msg.sender].picture = _newPicture;
        emit ChangedPicture(msg.sender, previousPicture, _newPicture);
    }

    /// @notice This function publishes a post with a given content and parent ID (set to 0 if it is not a comment)
    /// @param _content The content of the post to be created
    /// @param _link The link of the source
    /// @param _category The ID of the category
    /// @param _parentPostID The ID of the parent post if it's a comment (0 for a new post)
    /** 
     * @dev
     * This function creates a new post or comment based on the provided content, link, category and parent post ID
     * This function reverts if a post with the next unused publication ID already exists
     * This function reverts if _content doesn't have between 1 and 300 characters
     * This function reverts if a category other than 0 is given to a comment
     * This function reverts if _category is bigger than numberOfCategories
     * This function reverts if _link is longer than 300 characters
     * This function reverts if _link is shorter than 10 characters
     * If the post is a comment, the function does not revert if _link is empty
     * This function reverts if the parent post already has 40 comments
     * The category ID is given to the frontend, which will use it to get the actual category
     * This function stores the new post ID in the lastPostsIDs array of its author
     * This function stores the new post ID in the lastPosts array of its category
     * This function links a comment to its parent post and emits a NewPost event
     */
    function post(string calldata _content, string calldata _link, uint _category, uint _parentPostID) external {
        require(!postByID[nextUnusedPublicationID].exists, "Error : Post already exists");
        require(bytes(_content).length != 0, "Publication can't be empty");
        require(bytes(_content).length <= 300, "Publications are limited to 300 characters");
        require (_parentPostID != 0 && _category == 0 || _parentPostID == 0, "Comments can not have a category");
        require(_category <= numberOfCategories, "This category does not exist");
        require((_parentPostID != 0 && bytes(_link).length == 0) || (bytes(_link).length > 10), "Links must be at least 10 characters long, unless post is a comment in which case it can be empty");
        require(bytes(_link).length <= 300, "Links are limited to 300 characters");
        require(_parentPostID == 0 || postByID[_parentPostID].commentsIDs.length < 40, "Posts can not have more than 40 comments");
        uint _publicationID = nextUnusedPublicationID;
        if (_parentPostID != 0) {
            require(postByID[_parentPostID].exists, "Parent post doesn't exist");
            postByID[_publicationID].isCommentOfID = _parentPostID;
            postByID[_parentPostID].commentsIDs.push(_publicationID);
        }
        postByID[_publicationID].exists = true;
        postByID[_publicationID].id = _publicationID;
        postByID[_publicationID].poster = msg.sender;
        postByID[_publicationID].content = _content;
        postByID[_publicationID].date = block.timestamp;
        postByID[_publicationID].link = _link;
        postByID[_publicationID].category = _category;
        userByAddress[msg.sender].lastPostsIDs[userByAddress[msg.sender].positionInPostsArray] = _publicationID;
        if (userByAddress[msg.sender].positionInPostsArray == 24) {
            userByAddress[msg.sender].positionInPostsArray = 0;
        } else {
            ++userByAddress[msg.sender].positionInPostsArray;
        }
        category[_category].lastPosts[category[_category].positionInArray] = _publicationID;
        if (category[_category].positionInArray == 39) {
            category[_category].positionInArray = 0;
        } else {
            ++category[_category].positionInArray;
        }
        ++nextUnusedPublicationID;
        emit NewPost(_publicationID, msg.sender);
    }

    /// @notice This function downvotes the publication with given ID
    /// @param _publicationID The ID of the publication being downvoted
    /** 
     * @dev
     * This function adjusts the score of the poster and post, updates vote status, and calls setNewTopUsers
     * This function can emit a RemovedDownvote or Downvoted based on the current vote
     */
    function downvote(uint _publicationID) external publicationExists(_publicationID) {
        address _poster = postByID[_publicationID].poster;
        if (upvoteOrDownvote(msg.sender, _publicationID) == 1) {
            ++userByAddress[_poster].score;
            ++monthlyProfileScore[month][_poster];
            ++postByID[_publicationID].score;
            hasVoted[msg.sender][_publicationID] = Vote.NoVote;
            emit RemovedDownvote(msg.sender, _publicationID);
        } else if (upvoteOrDownvote(msg.sender, _publicationID) == 2) {
            userByAddress[_poster].score -= 2;
            monthlyProfileScore[month][_poster] -=2;
            postByID[_publicationID].score -= 2;
            hasVoted[msg.sender][_publicationID] = Vote.Downvote;
            emit RemovedUpvote(msg.sender, _publicationID);
            emit Downvoted(msg.sender, _publicationID);
        } else {
            --userByAddress[_poster].score;
            --monthlyProfileScore[month][_poster];
            --postByID[_publicationID].score;
            hasVoted[msg.sender][_publicationID] = Vote.Downvote;
            emit Downvoted(msg.sender, _publicationID);
        }
        setNewTopUsers(_poster);
    }

    /// @notice This function upvotes the publication with given ID
    /// @param _publicationID The ID of the publication being upwnvoted
    /** 
     * @dev
     * This function adjusts the score of the poster and post, updates vote status, and calls setNewTopUsers
     * This function can emit a RemovedUpvote or Upvoted based on the current vote
     */
    function upvote(uint _publicationID) external publicationExists(_publicationID) {
        address _poster = postByID[_publicationID].poster;
        if (upvoteOrDownvote(msg.sender, _publicationID) == 2) {
            --userByAddress[_poster].score;
            --monthlyProfileScore[month][_poster];
            --postByID[_publicationID].score;
            hasVoted[msg.sender][_publicationID] = Vote.NoVote;
            emit RemovedUpvote(msg.sender, _publicationID);
        } else if (upvoteOrDownvote(msg.sender, _publicationID) == 1) {
            userByAddress[_poster].score += 2;
            monthlyProfileScore[month][_poster] += 2;
            postByID[_publicationID].score += 2;
            hasVoted[msg.sender][_publicationID] = Vote.Upvote;
            emit RemovedDownvote(msg.sender, _publicationID);
            emit Upvoted(msg.sender, _publicationID);
        } else {
            ++userByAddress[_poster].score;
            ++monthlyProfileScore[month][_poster];
            ++postByID[_publicationID].score;
            hasVoted[msg.sender][_publicationID] = Vote.Upvote;
            emit Upvoted(msg.sender, _publicationID);
        }
        setNewTopUsers(_poster);
    }

    /// @notice This function repost the publication with given ID
    /// @param _reposted The ID of the original post
    /** 
     * @dev
     * This function creates a new post that points to the original post
     * This function reverts if a post with the next unused publication ID already exists
     * This function reverts if the original post is already a repost
     * This function stores the new post ID in the lastPostsIDs array of its author
     * This function emits a Reposted event
     */
    function repost(uint _reposted) external publicationExists(_reposted) {
        require(!postByID[nextUnusedPublicationID].exists, "Error : Post already exists");
        require(postByID[_reposted].isRepostOf == 0, "You can not repost a repost");
        uint _publicationID = nextUnusedPublicationID;
        postByID[_publicationID].exists = true;
        postByID[_publicationID].id = _publicationID;
        postByID[_publicationID].poster = msg.sender;
        postByID[_publicationID].isRepostOf = _reposted;
        userByAddress[msg.sender].lastPostsIDs[userByAddress[msg.sender].positionInPostsArray] = _publicationID;
        if (userByAddress[msg.sender].positionInPostsArray == 24) {
            userByAddress[msg.sender].positionInPostsArray = 0;
        } else {
            ++userByAddress[msg.sender].positionInPostsArray;
        }
        ++nextUnusedPublicationID;       
        emit Reposted(msg.sender, _reposted, _publicationID);
    }

    /// @notice This function allows the user to follow another user
    /// @param _followed The address of the user to be followed
    /** 
     * @dev
     * This function reverts if the caller passes its own address as argument
     * This function reverts if the caller already follows the user in argument
     * This function reverts if the caller already follows 40 users
     * This function allows a user to follow another user by updating their follow status
     * This function updates the follow status, followings list, number of followers and emits a Followed event
     */
    function follow(address _followed) public {
        require(_followed != msg.sender, "You can't follow yourself");
        require(!follows[msg.sender][_followed].follows, "You already follow this user");
        require(userByAddress[msg.sender].followingsList.number < 40, "You can not follow more than 40 users");
        follows[msg.sender][_followed].follows = true;
        userByAddress[msg.sender].followingsList.followList.push(_followed);
        ++userByAddress[msg.sender].followingsList.number;
        ++userByAddress[_followed].numberOfFollowers;
        follows[msg.sender][_followed].positionInFollowingsArray = userByAddress[msg.sender].followingsList.followList.length - 1;
        emit Followed(msg.sender, _followed);
    }

    /// @notice This function allows the user to unfollow another user
    /// @param _followed The address of the user to be unfollowed
    /** 
     * @dev
     * This function reverts if the caller passes its own address as argument
     * This function reverts if the caller doesn't follow the user in argument
     * This function allows a user to unfollow another user by updating their follow status
     * This function updates the follow status, followings list, number of followers and emits a Unfollowed event
     */
    function unfollow(address _unfollowed) public {
        require(_unfollowed != msg.sender, "You can't unfollow yourself");
        require(follows[msg.sender][_unfollowed].follows, "You don't follow this user");
        follows[msg.sender][_unfollowed].follows = false;
        uint positionInFollowingsArray = follows[msg.sender][_unfollowed].positionInFollowingsArray;
        userByAddress[msg.sender].followingsList.followList[positionInFollowingsArray] = address(0);
        --userByAddress[msg.sender].followingsList.number;
        --userByAddress[_unfollowed].numberOfFollowers;
        emit Unfollowed(msg.sender, _unfollowed);
    }

    /// @notice This function can only be called by the owner and gives a SFT to the top users of the month
    /** 
     * @dev
     * This function reverts if not called by the owner
     * This function reverts if one of the top users already owns a SFT with the current month as ID
     * This function queries the topUsersSFT contract
     * This function sets the topUsers array back to 0
     * This function updates the month for the next reward period, depending on the current month
     */
    function rewardTopUsers() public onlyOwner {
        for(uint i = 0; i < topUsers.length; i++) {
            if (topUsers[i] != address(0)) {
                require(!hasBeenRewarded(topUsers[i], month), "This user has already been rewarded");
                topUsersSFT.mintOne(topUsers[i], month);
                userByAddress[topUsers[i]].SFTIDs.push(month);
                topUsers[i] = address(0);
            }
        }
        if (month % 100 == 12) {
            month += 89;
        } else {
            ++month;
        }
    }
}