// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/FairPay.sol";

contract FairPayTest is Test {
    FairPay public fairPay;
    address employer = address(0x1);
    address employee = address(0x2);
    string termsCID = "QmFakeIPFSCID";

    function setUp() public {
        fairPay = new FairPay();
        vm.deal(employer, 10 ether);
        vm.deal(employee, 1 ether);
    }

    function testCreateAgreement() public {
        vm.prank(employer);
        fairPay.createAgreement{value: 1 ether}(
            employee,
            termsCID,
            10,
            0.1 ether
        );

        (,, string memory cid,, uint256 duration,,,) = fairPay.agreements(0);
        assertEq(cid, termsCID);
        assertEq(duration, 10);
    }

    function testAcceptAgreement() public {
        vm.prank(employer);
        fairPay.createAgreement{value: 1 ether}(
            employee,
            termsCID,
            10,
            0.1 ether
        );

        vm.prank(employee);
        fairPay.acceptAgreement(0);

        (, , , , , , uint256 status,,) = fairPay.agreements(0);
        assertEq(status, 1); // Active
    }

    function testRequestDelay() public {
        vm.prank(employer);
        fairPay.createAgreement{value: 1 ether}(
            employee,
            termsCID,
            10,
            0.1 ether
        );

        vm.prank(employee);
        fairPay.acceptAgreement(0);

        vm.prank(employee);
        fairPay.requestDelay(0, "more time");

        (, , , , , , , bool delayed, string memory reason) = fairPay.agreements(0);
        assertTrue(delayed);
        assertEq(reason, "more time");
    }

    function testReleasePayment() public {
        vm.prank(employer);
        fairPay.createAgreement{value: 1 ether}(
            employee,
            termsCID,
            1,
            1 ether
        );

        vm.prank(employee);
        fairPay.acceptAgreement(0);

        skip(1 days);
        vm.prank(employer);
        fairPay.releasePayment(0);

        (, , , , , , uint256 status,,) = fairPay.agreements(0);
        assertEq(status, 2); // Completed
    }
}
