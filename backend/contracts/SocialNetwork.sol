// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TopUsersSFT.sol";

contract SocialNetwork is Ownable {

    enum Vote { NoVote, Downvote, Upvote }

    mapping (address => int) profileScore;
    mapping (uint => mapping (address => int)) monthlyProfileScore;
    mapping (uint => int) publicationScore;
    mapping (address => mapping (uint => Vote)) hasVoted;
    mapping (uint => address) publicationPoster;
    
    address[3] topUsers;
    uint public month = 202312;
    
    TopUsersSFT topUsersSFT = new TopUsersSFT();

    event NewPost(uint publicationID, address poster);
    event Upvoted(address voter, uint publicationID);
    event RemovedUpvote(address voter, uint publicationID);
    event Downvoted(address voter, uint publicationID);
    event RemovedDownvote(address voter, uint publicationID);
    event newTopUser(address newTopUser, address previousTopUser);

    constructor() Ownable(msg.sender) {}

    modifier publicationExists(uint _publicationID) {
        require(publicationPoster[_publicationID] != address(0), "Publication with given ID does not exist");
        _;
    }

    function getProfileScore(address _user) external view returns (int) {
        return profileScore[_user];
    }

    function getMonthlyProfileScore(address _user, uint _month) external view returns (int) {
        require(_month <= month, "Given month is in the future");
        return monthlyProfileScore[_month][_user];
    }

    function getPublicationScore(uint _publicationID) external publicationExists(_publicationID) view returns (int) {
        return publicationScore[_publicationID];
    }

    function getPublicationPoster(uint _publicationID) external publicationExists(_publicationID) view returns (address) {
        return publicationPoster[_publicationID];
    }

    function hasBeenRewarded(address _user, uint _month) external view returns (bool) {
        uint SFTnumber = topUsersSFT.balanceOf(_user, _month);
        require(SFTnumber < 2, "Error. The user shouldn't have more than one SFT for a month.");
        if (SFTnumber == 1) return true;
        else return false;
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
                    emit newTopUser(address(0), _user);
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
                emit newTopUser(_user, previousTopUser);
            }
        }
    }

    function post(uint _publicationID) external { // attention si cette fonction n'est pas appelée par la dapp peut causer des soucis
        require(publicationPoster[_publicationID] == address(0), "Publication with given ID already exists");
        publicationPoster[_publicationID] = msg.sender;
        emit NewPost(_publicationID, msg.sender);
    }

    function downvote(uint _publicationID) external publicationExists(_publicationID) {
        address _poster = publicationPoster[_publicationID];
        if (upvoteOrDownvote(msg.sender, _publicationID) == 1) {
            ++profileScore[_poster];
            ++monthlyProfileScore[month][_poster];
            ++publicationScore[_publicationID];
            hasVoted[msg.sender][_publicationID] = Vote.NoVote;
            emit RemovedDownvote(msg.sender, _publicationID);
        } else if (upvoteOrDownvote(msg.sender, _publicationID) == 2) {
            profileScore[_poster] -= 2;
            monthlyProfileScore[month][_poster] -=2;
            publicationScore[_publicationID] -= 2;
            hasVoted[msg.sender][_publicationID] = Vote.Downvote;
            emit RemovedUpvote(msg.sender, _publicationID);
            emit Downvoted(msg.sender, _publicationID);
        } else {
            --profileScore[_poster];
            --monthlyProfileScore[month][_poster];
            --publicationScore[_publicationID];
            hasVoted[msg.sender][_publicationID] = Vote.Downvote;
            emit Downvoted(msg.sender, _publicationID);
        }
        setNewTopUsers(_poster);
    }

    function upvote(uint _publicationID) external publicationExists(_publicationID) {
        address _poster = publicationPoster[_publicationID];
        if (upvoteOrDownvote(msg.sender, _publicationID) == 2) {
            --profileScore[_poster];
            --monthlyProfileScore[month][_poster];
            --publicationScore[_publicationID];
            hasVoted[msg.sender][_publicationID] = Vote.NoVote;
            emit RemovedUpvote(msg.sender, _publicationID);
        } else if (upvoteOrDownvote(msg.sender, _publicationID) == 1) {
            profileScore[_poster] += 2;
            monthlyProfileScore[month][_poster] += 2;
            publicationScore[_publicationID] += 2;
            hasVoted[msg.sender][_publicationID] = Vote.Upvote;
            emit RemovedDownvote(msg.sender, _publicationID);
            emit Upvoted(msg.sender, _publicationID);
        } else {
            ++profileScore[_poster];
            ++monthlyProfileScore[month][_poster];
            ++publicationScore[_publicationID];
            hasVoted[msg.sender][_publicationID] = Vote.Upvote;
            emit Upvoted(msg.sender, _publicationID);
        }
        setNewTopUsers(_poster);
    }

    function rewardTopUsers() public onlyOwner {
        for(uint i = 0; i < topUsers.length; i++) {
            if (topUsers[i] != address(0)) {
                topUsersSFT.mintOne(topUsers[i], month);
            }
        }
        if (month % 100 == 12) {
            month += 89;
        } else {
            month += 1;
        }
    }
}