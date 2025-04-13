const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FairPay Contract", function () {
  let fairPay;
  let employer, employee, other;
  const termsCID = "QmFakeIPFSCID";

  beforeEach(async () => {
    [employer, employee, other] = await ethers.getSigners();
    const FairPay = await ethers.getContractFactory("FairPay");
    fairPay = await FairPay.deploy();
    await fairPay.deployed();
  });

  it("should create an agreement", async () => {
    const duration = 5;
    const dailyRate = ethers.utils.parseEther("0.01");
    const total = dailyRate.mul(duration);

    await expect(fairPay.connect(employer).createAgreement(
      employee.address,
      termsCID,
      duration,
      dailyRate,
      { value: total }
    )).to.emit(fairPay, "AgreementCreated");

    const agreement = await fairPay.agreements(0);
    expect(agreement.employee).to.equal(employee.address);
  });

  it("should allow employee to accept agreement", async () => {
    const duration = 5;
    const dailyRate = ethers.utils.parseEther("0.01");
    const total = dailyRate.mul(duration);

    await fairPay.connect(employer).createAgreement(
      employee.address,
      termsCID,
      duration,
      dailyRate,
      { value: total }
    );

    await expect(fairPay.connect(employee).acceptAgreement(0))
      .to.emit(fairPay, "AgreementAccepted");

    const agreement = await fairPay.agreements(0);
    expect(agreement.status).to.equal(1); // Active
  });

  it("should allow payment release", async () => {
    const duration = 1;
    const dailyRate = ethers.utils.parseEther("0.01");
    const total = dailyRate.mul(duration);

    await fairPay.connect(employer).createAgreement(
      employee.address,
      termsCID,
      duration,
      dailyRate,
      { value: total }
    );

    await fairPay.connect(employee).acceptAgreement(0);

    await network.provider.send("evm_increaseTime", [86400]); // 1 day
    await network.provider.send("evm_mine");

    await expect(fairPay.connect(employer).releasePayment(0))
      .to.emit(fairPay, "PaymentReleased");
  });

  it("should allow delay request", async () => {
    const duration = 1;
    const dailyRate = ethers.utils.parseEther("0.01");
    const total = dailyRate.mul(duration);

    await fairPay.connect(employer).createAgreement(
      employee.address,
      termsCID,
      duration,
      dailyRate,
      { value: total }
    );

    await fairPay.connect(employee).acceptAgreement(0);

    await expect(fairPay.connect(employee).requestDelay(0, "Need more time"))
      .to.emit(fairPay, "PaymentDelayed");
  });
});
