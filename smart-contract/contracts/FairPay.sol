// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FairPay {
    enum AgreementStatus { Pending, Active, Completed }

    struct Agreement {
        address employer;
        address employee;
        string termsCID;
        uint256 startTime;
        uint256 duration; // in days
        uint256 dailyRate;
        AgreementStatus status;
        bool delayed;
        string delayReason;
    }

    uint256 public agreementCount;
    mapping(uint256 => Agreement) public agreements;

    event AgreementCreated(uint256 indexed id, address indexed employer, address indexed employee);
    event AgreementAccepted(uint256 indexed id, address indexed employee);
    event PaymentReleased(uint256 indexed id, uint256 amount);
    event PaymentDelayed(uint256 indexed id, string reason);

    modifier onlyEmployer(uint256 _id) {
        require(msg.sender == agreements[_id].employer, "Not employer");
        _;
    }

    modifier onlyEmployee(uint256 _id) {
        require(msg.sender == agreements[_id].employee, "Not employee");
        _;
    }

    function createAgreement(
        address _employee,
        string memory _termsCID,
        uint256 _duration,
        uint256 _dailyRate
    ) external payable returns (uint256) {
        require(_employee != address(0), "Invalid employee");
        require(_duration > 0, "Invalid duration");
        require(msg.value == _dailyRate * _duration, "Incorrect payment");

        agreements[agreementCount] = Agreement({
            employer: msg.sender,
            employee: _employee,
            termsCID: _termsCID,
            startTime: 0,
            duration: _duration,
            dailyRate: _dailyRate,
            status: AgreementStatus.Pending,
            delayed: false,
            delayReason: ""
        });

        emit AgreementCreated(agreementCount, msg.sender, _employee);
        return agreementCount++;
    }

    function acceptAgreement(uint256 _id) external onlyEmployee(_id) {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == AgreementStatus.Pending, "Invalid status");

        agreement.status = AgreementStatus.Active;
        agreement.startTime = block.timestamp;

        emit AgreementAccepted(_id, msg.sender);
    }

    function releasePayment(uint256 _id) external onlyEmployer(_id) {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == AgreementStatus.Active, "Not active");
        require(block.timestamp >= agreement.startTime, "Not started");

        uint256 elapsedDays = (block.timestamp - agreement.startTime) / 1 days;
        if (elapsedDays > agreement.duration) {
            elapsedDays = agreement.duration;
        }

        uint256 payableDays = elapsedDays;
        if (agreement.delayed) {
            payableDays -= 1;
            agreement.delayed = false;
        }

        uint256 amount = payableDays * agreement.dailyRate;
        require(amount > 0, "No payment due");

        agreement.startTime = block.timestamp;
        payable(agreement.employee).transfer(amount);

        if (payableDays == agreement.duration) {
            agreement.status = AgreementStatus.Completed;
        }

        emit PaymentReleased(_id, amount);
    }

    function requestDelay(uint256 _id, string memory _reason) external onlyEmployee(_id) {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == AgreementStatus.Active, "Not active");
        require(!agreement.delayed, "Already delayed");

        agreement.delayed = true;
        agreement.delayReason = _reason;

        emit PaymentDelayed(_id, _reason);
    }
}
