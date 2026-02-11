const hre = require("hardhat");

async function main() {
  const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const KEY_HASH =
    "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const SUB_ID =
    "101732621275221634218057789852224837651671635978470801236123284400362240931790";

  const Lottery = await hre.ethers.getContractFactory("Lottery");

  // 部署合约（不发送 ETH，因为构造函数不是 payable）
  console.log("Deploying Lottery contract...");
  const lottery = await Lottery.deploy(VRF_COORDINATOR, SUB_ID, KEY_HASH);

  await lottery.deployed();
  console.log("✅ Lottery deployed to:", lottery.address);

  // 向合约发送初始资金（用于支付奖金）
  const [deployer] = await hre.ethers.getSigners();
  console.log("\nSending 0.2 ETH to contract for prize pool...");
  const tx = await deployer.sendTransaction({
    to: lottery.address,
    value: hre.ethers.utils.parseEther("0.2"),
  });
  await tx.wait();
  console.log("✅ Sent 0.2 ETH to contract");

  console.log("\n📋 Summary:");
  console.log("NEW_LOTTERY_ADDRESS =", lottery.address);
  console.log("Contract Balance:", hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(lottery.address)), "ETH");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
