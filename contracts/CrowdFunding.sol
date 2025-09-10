// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract CrowdFunding {

    struct Campaign {
        address owner;
        string description;
        uint goal;
        uint deadline;
        uint amountRaised;
        bool withdrawn;
        mapping(address => uint) contributions;
        address[] contributors;
    }
    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;
    uint[] private campaignIds;

    event CampaignCreated(uint indexed id, address indexed owner, string description, uint goal, uint deadline);
    event ContributionReceived(uint indexed id, address indexed contributor, uint amount);
    event Withdrawn(uint indexed id, address indexed owner, uint amount);
    event Refunded(uint indexed id, address indexed contributor, uint amount);

    function createCampaign(string calldata description, uint goal, uint duration) external {
        require(goal > 0, "must be positive");
        require(duration > 0, "must be positive");
        campaignCount++;
        Campaign storage c = campaigns[campaignCount];
        c.owner = msg.sender;
        c.description = description;
        c.goal = goal;
        c.deadline = block.timestamp + duration;
        campaignIds.push(campaignCount);
        emit CampaignCreated(campaignCount, msg.sender, description, goal, c.deadline);
    }

    function contribute(uint id) external payable {
        Campaign storage c = campaigns[id];
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "No ETH sent");
        if (c.contributions[msg.sender] == 0) {
            c.contributors.push(msg.sender);
        }
        c.contributions[msg.sender] += msg.value;
        c.amountRaised += msg.value;
        emit ContributionReceived(id, msg.sender, msg.value);
    }

    function withdraw(uint id) external {
        Campaign storage c = campaigns[id];
        require(msg.sender == c.owner, "Not owner");
        require(block.timestamp >= c.deadline, "Not ended");
        require(c.amountRaised >= c.goal, "Goal not met");
        require(!c.withdrawn, "Already withdrawn");
        c.withdrawn = true;
        uint amount = c.amountRaised;
        (bool sent, ) = c.owner.call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdrawn(id, c.owner, amount);
    }

    function refund(uint id) external {
        Campaign storage c = campaigns[id];
        require(block.timestamp >= c.deadline, "Not ended");
        require(c.amountRaised < c.goal, "Goal met");
        uint contributed = c.contributions[msg.sender];
        require(contributed > 0, "No contribution");
        c.contributions[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: contributed}("");
        require(sent, "Refund failed");
        emit Refunded(id, msg.sender, contributed);
    }

    function getContributors(uint id) external view returns (address[] memory) {
        return campaigns[id].contributors;
    }

    function getContribution(uint id, address user) external view returns (uint) {
        return campaigns[id].contributions[user];
    }

    function getAllCampaignIds() external view returns (uint[] memory) {
        return campaignIds;
    }

    
    function getCampaignDetails(uint id) external view returns ( address owner, string memory description, uint goal, uint deadline, uint amountRaised, bool withdrawn
    ) {
        Campaign storage c = campaigns[id];
        return (c.owner, c.description, c.goal, c.deadline, c.amountRaised, c.withdrawn);
    }
}
