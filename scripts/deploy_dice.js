const hre = require("hardhat");

async function main() {
  const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const KEY_HASH =
    "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const SUB_ID =
    "101732621275221634218057789852224837651671635978470801236123284400362240931790";

  const DiceGame = await hre.ethers.getContractFactory("DiceGame");

  // 部署合约（不发送 ETH，因为构造函数不是 payable）
  console.log("Deploying DiceGame contract...");
  const diceGame = await DiceGame.deploy(VRF_COORDINATOR, SUB_ID, KEY_HASH);

  await diceGame.deployed();
  console.log("✅ DiceGame deployed to:", diceGame.address);

  // 向合约发送初始资金（用于支付赔付）
  const [deployer] = await hre.ethers.getSigners();
  const initialFunding = "0.1"; // 降低初始资金到 0.1 ETH
  
  try {
    console.log(`\nSending ${initialFunding} ETH to contract for payouts...`);
    const tx = await deployer.sendTransaction({
      to: diceGame.address,
      value: hre.ethers.utils.parseEther(initialFunding),
    });
    await tx.wait();
    console.log(`✅ Sent ${initialFunding} ETH to contract`);
  } catch (error) {
    console.log("⚠️  Failed to send initial funding (insufficient balance)");
    console.log("   You can fund the contract later using a separate transaction");
  }

  console.log("\n📋 Summary:");
  console.log("NEW_DICE_ADDRESS =", diceGame.address);
  console.log("Contract Balance:", hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(diceGame.address)), "ETH");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
