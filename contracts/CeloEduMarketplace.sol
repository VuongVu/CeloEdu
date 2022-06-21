// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CeloEduMarketplace {
    using Counters for Counters.Counter;

    address internal cUSDTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Course {
        address payable owner;
        string title;
        string description;
        string content;
        string author;
        string image;
        uint price;
        uint sold;
    }

    struct Learner {
        address owner;
        bool isComplete;
    }

    mapping(uint256 => Course) internal courses;
    mapping(uint256 => Learner[]) internal learners;
    Counters.Counter public totalCourses;

    function addCourse(
        string memory _title, 
        string memory _description,
        string memory _author,
        string memory _image,
        string memory _content,
        uint _price
    ) public {
        uint256 courseIndex = totalCourses.current();
        totalCourses.increment();
        uint _sold = 0;

        courses[courseIndex] = Course(
            payable(msg.sender), 
            _title, 
            _description, 
            _author, 
            _image, 
            _price, 
            _sold
        );
    }

    function getCourse(uint _index) public view returns (
        address payable,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint,
        uint
    ) {
        Course storage c = courses[_index];

        return (
            c.owner, 
            c.title, 
            c.description, 
            c.author, 
            c.image, 
            c.price, 
            c.content,
            c.sold
        );
    }

    function buyCourse(uint _index) public payable {
        IERC20 cUSD = IERC20(cUSDTokenAddress);
        Course storage c = courses[_index];

        require(!isBoughtCourse(_index), "Course has already been bought");
        require(cUSD.balanceOf(msg.sender) > c.price, "Not enough cUSD");

        require(
            cUSD.transferFrom(
                msg.sender, 
                c.owner, 
                c.price
            ), 
            "Failed to transfer funds"
        );

        c.sold++;
        learners[_index].push(Learner(msg.sender, false));
    }

    //Function using which the users can support their favorite creators financially
    function supportCreator(uint _index, uint _amount) public payable{
        IERC20 cUSD = IERC20(cUSDTokenAddress);
        Course storage c = courses[_index];

        require(cUSD.balanceOf(msg.sender) > _amount, "Not enough cUSD");

        require(
            cUSD.transferFrom(
                msg.sender, 
                c.owner, 
                _amount
            ), 
            "Failed to transfer funds"
        );

    }

    function completeCourse(uint _index) public payable {
        require(isBoughtCourse(_index), "Need to buy course first");
        require(!isCompleteCourse(_index), "Course is already complete");

        Learner[] storage _learners = learners[_index];

        for (uint i = 0; i < _learners.length; i++) {
            if (_learners[i].owner == msg.sender) {
                _learners[i].isComplete = true;
                break;
            }
        }
    }

    function isBoughtCourse(uint _index) public view returns (bool) {
        Learner[] memory _learners = getCourseLearners(_index);

        for (uint i = 0; i < _learners.length; i++) {
            if (_learners[i].owner == msg.sender) {
                return true;
            }
        }

        return false;
    }

    function isCompleteCourse(uint _index) public view returns (bool) {
        Learner[] memory _learners = getCourseLearners(_index);

        for (uint i = 0; i < _learners.length; i++) {
            if (_learners[i].owner == msg.sender) {
                return _learners[i].isComplete;
            }
        }

        return false;
    }

    function getCourseLearners(uint _index) public view returns (Learner[] memory) {
        Learner[] memory _learners = learners[_index];
        return _learners;
    }
}