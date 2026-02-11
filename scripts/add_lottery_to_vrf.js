const hre = require("hardhat");

async function main() {
  console.log('\n🔗 添加新合约到 VRF Subscription...\n');

  const VRF_COORDINATOR = process.env.VRF_COORDINATOR;
  const SUBSCRIPTION_ID = process.env.SUBSCRIPTION_ID;
  const NEW_LOTTERY = process.env.LOTTERY_CONTRACT;

  console.log(`VRF Coordinator: ${VRF_COORDINATOR}`);
  console.log(`Subscription ID: ${SUBSCRIPTION_ID}`);
  console.log(`新 Lottery 合约: ${NEW_LOTTERY}\n`);

  const coordinatorABI = [
    "function addConsumer(uint256 subId, address consumer) external"
  ];

  const coordinator = new hre.ethers.Contract(
    VRF_COORDINATOR,
    coordinatorABI,
    (await hre.ethers.getSigners())[0]
  );

  console.log('⏳ 正在添加 Consumer...');
  const tx = await coordinator.addConsumer(SUBSCRIPTION_ID, NEW_LOTTERY);
  console.log(`   交易: ${tx.hash}`);
  
  await tx.wait();
  console.log('✅ 添加成功！\n');

  console.log('📋 下一步:');
  console.log('  1. 访问: https://vrf.chain.link/sepolia/' + SUBSCRIPTION_ID);
  console.log(`  2. 确认 Consumers 列表中包含: ${NEW_LOTTERY}`);
  console.log('  3. 测试购票 → 开奖流程\n');
}

main().catch((e) => {
  console.error('\n❌ 错误:', e.message);
  if (e.message.includes('already added')) {
    console.log('\n✅ 合约已经在 Subscription 的 Consumers 列表中！');
  }
  process.exit(1);
});
