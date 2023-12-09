// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TopUsersSFT.sol";

contract SocialNetwork is Ownable {

    enum Vote { NoVote, Downvote, Upvote }

    struct Post {
        bool exists;
        uint id;
        address poster;
        string content;
        uint isCommentOfID;
        int score;
        uint[] commentsIDs;
    }

    struct Follow {
        bool follows;
        uint positionInFollowingsArray;
        uint positionInFollowersArray;
    }

    struct FollowList {
        address[] followList;
        uint number;
    }

    struct User {
        string name;
        int score;
        FollowList followingsList;
        FollowList followersList;
        uint[] postsIDs;
        uint[] SFTIDs;
    }

    mapping (uint => mapping (address => int)) monthlyProfileScore;
    mapping (address => mapping (uint => Vote)) hasVoted;
    mapping (uint => Post) postByID;
    mapping (address => mapping (address => Follow)) follows;
    mapping (address => User) userByAddress;
    
    address[10] topUsers;
    uint public month = 202312;
    uint public nextUnusedPublicationID = 1;
    
    TopUsersSFT topUsersSFT = new TopUsersSFT();

    event NewPost(uint publicationID, address poster);
    event Upvoted(address voter, uint publicationID);
    event RemovedUpvote(address voter, uint publicationID);
    event Downvoted(address voter, uint publicationID);
    event RemovedDownvote(address voter, uint publicationID);
    event ChangedName(address user, string previousName, string newName);
    event NewTopUser(address newTopUser, address previousTopUser);
    event Followed(address follower, address followed);
    event Unfollowed(address follower, address followed);


    constructor() Ownable(msg.sender) {}

    modifier publicationExists(uint _publicationID) {
        require(postByID[_publicationID].exists, "Publication with given ID does not exist");
        _;
    }

    function getMonthlyProfileScore(address _user, uint _month) external view returns (int) {
        require(_month <= month, "Given month is in the future");
        return monthlyProfileScore[_month][_user];
    }

    function doesFollow(address _user, address _target) external view returns (bool) {
        return follows[_user][_target].follows;
    }

    function getPublication(uint _publicationID) external publicationExists(_publicationID) view returns (Post memory) {
        return postByID[_publicationID];
    }

    function getUser(address _user) external view returns (User memory) {
        require (_user != address(0), "User with address 0 does not exist");
        return userByAddress[_user];
    }

    function hasBeenRewarded(address _user, uint _month) public view returns (bool) {
        uint SFTnumber = topUsersSFT.balanceOf(_user, _month);
        require(SFTnumber < 2, "Error. The user shouldn't have more than one SFT for a month.");
        if (SFTnumber == 1) return true;
        else return false;
    }

    function getSFTURI() external view returns (string memory) {
        return topUsersSFT.uri(202312);
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

    function changeName(string calldata _newName) external {
        require(bytes(_newName).length <= 24, "Name must not be longer than 24 characters");
        string memory previousName = userByAddress[msg.sender].name;
        userByAddress[msg.sender].name = _newName;
        emit ChangedName(msg.sender, previousName, _newName);
    }

    function post(string calldata _content, uint _parentPostID) external { // attention si cette fonction n'est pas appelée par la dapp peut causer des soucis
        require(!postByID[nextUnusedPublicationID].exists, "Error : Post already exists");
        require(bytes(_content).length != 0, "Publication can't be empty");
        require(bytes(_content).length <= 300, "Publications are limited to 300 characters");
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
        userByAddress[msg.sender].postsIDs.push(_publicationID);
        ++nextUnusedPublicationID;
        emit NewPost(_publicationID, msg.sender);
    }

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

    function follow(address _followed) public {
        require(_followed != msg.sender, "You can't follow yourself");
        require(!follows[msg.sender][_followed].follows, "You already follow this user");
        follows[msg.sender][_followed].follows = true;
        userByAddress[msg.sender].followingsList.followList.push(_followed);
        ++userByAddress[msg.sender].followingsList.number;
        userByAddress[_followed].followersList.followList.push(msg.sender);
        ++userByAddress[_followed].followersList.number;
        follows[msg.sender][_followed].positionInFollowingsArray = userByAddress[msg.sender].followingsList.followList.length - 1;
        follows[msg.sender][_followed].positionInFollowersArray = userByAddress[_followed].followersList.followList.length - 1;
        emit Followed(msg.sender, _followed);
    }

    function unfollow(address _unfollowed) public {
        require(_unfollowed != msg.sender, "You can't unfollow yourself");
        require(follows[msg.sender][_unfollowed].follows, "You don't follow this user");
        follows[msg.sender][_unfollowed].follows = false;
        uint positionInFollowingsArray = follows[msg.sender][_unfollowed].positionInFollowingsArray;
        uint positionInFollowersArray = follows[msg.sender][_unfollowed].positionInFollowersArray;
        userByAddress[msg.sender].followingsList.followList[positionInFollowingsArray] = address(0);
        --userByAddress[msg.sender].followingsList.number;
        userByAddress[_unfollowed].followersList.followList[positionInFollowersArray] = address(0);
        --userByAddress[_unfollowed].followersList.number;
        emit Unfollowed(msg.sender, _unfollowed);
    }

    function rewardTopUsers() public onlyOwner {
        for(uint i = 0; i < topUsers.length; i++) {
            if (topUsers[i] != address(0)) {
                require(!hasBeenRewarded(topUsers[i], month), "This user has already been rewarded");
                topUsersSFT.mintOne(topUsers[i], month);
                userByAddress[topUsers[i]].SFTIDs.push(month);
            }
        }
        if (month % 100 == 12) {
            month += 89;
        } else {
            ++month;
        }
    }
}