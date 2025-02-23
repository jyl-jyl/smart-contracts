const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert,
  time, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const helper = require("./helper_functions");
const fs = require('fs');
const path = require('path');

const durationUpperBound = 1000;
const investAmountLowerBound = 10;
const investAmountUpperBound = 100;
const goalLowerBound = 10;
const goalUpperBound = 1000;
const lowerBound = 10;
const upperBound = 1000;

const testFolder = path.join(__dirname, `../tracefiles/crowdsale`);
// set up tests for contracts
const testPath = path.join(testFolder, '/setup.txt');
const setup = fs.readFileSync(testPath, 'utf-8');
let contractName;
let deployAccountCount = 10;
setup.split(/\r?\n/).some(line => {
  let lineArr = line.split(',');
  if(lineArr[0] == 'n') {
    contractName = lineArr[1];
    return true;
  }
  if(lineArr[0] == 'a') {
    deployAccountCount = +lineArr[1];
  }
})

// read setup.txt in each test folder
const transactionFolders = fs.readdirSync(testFolder, {withFileTypes: true})
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
const transactionCounts = transactionFolders.length;
var transactionName;
var transactionFolderPath;
var setupPath;
var transactionCount = 1;
var tracefileCount = 0;

helper.range(transactionCounts).forEach(l => {
  transactionName = transactionFolders[l];
  // get the setup file
  transactionFolderPath = path.join(testFolder, `/${transactionName}`);
  setupPath = path.join(transactionFolderPath, '/setup.txt');
  // get the transaction count in setup.txt for each transaction
  if (fs.existsSync(setupPath)) {
    console.log('setup exists');
    const setupFS = fs.readFileSync(setupPath, 'utf-8');
    const setupLines = setupFS.split(/\r?\n/);
    let i = 0;
    while(i < setupLines.length) {
      let sl = setupLines[i];
      if (sl.startsWith('nt')) {
        transactionCount = +sl.split(',')[1];
      }
      i++;
    }
  }

  // if(transactionName == 'deposit') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let beneficiary = helper.random(0, deployAccountCount);
  //     let ownerIndex = helper.random(0, deployAccountCount);
  //     let goal = helper.random(goalLowerBound, goalUpperBound+1);
  //     let depositAccountIndex = helper.random(0, deployAccountCount);
  //     let depositAmount = helper.random(lowerBound, upperBound+1);
  //     let text = `deposit,constructor,,${goal} accounts[${beneficiary}],${ownerIndex},,false\ndeposit,deposit,instance,accounts[${depositAccountIndex}],${ownerIndex},web3.utils.toWei(${depositAmount} ether),true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }   


  // if(transactionName == 'withdraw') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let beneficiary = helper.random(0, deployAccountCount);
  //     let ownerIndex = helper.random(0, deployAccountCount);
  //     let goal = helper.random(goalLowerBound, goalUpperBound+1);
  //     let duration = helper.random(31, durationUpperBound+1);
  //     let depositAccountIndex = helper.random(0, deployAccountCount);
  //     let depositAmount = helper.random(lowerBound, upperBound+1);
  //     let text = `withdraw,constructor,,${goal} accounts[${beneficiary}],${ownerIndex},,false\nwithdraw,deposit,instance,accounts[${depositAccountIndex}],${ownerIndex},web3.utils.toWei(${depositAmount} ether),false\nwithdraw,increase,time,time.duration.days[${duration}],,,false\nwithdraw,close,instance,,${ownerIndex},,false\nwithdraw,withdraw,instance,,${ownerIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }
  // if(transactionName == 'refund') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let beneficiary = helper.random(0, deployAccountCount);
  //     let ownerIndex = helper.random(0, deployAccountCount);
  //     let goal = helper.random(goalLowerBound, goalUpperBound+1);
  //     let text = `refund,constructor,,${goal} accounts[${beneficiary}],${ownerIndex},,false\nrefund,refund,instance,,${ownerIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }  


  if(transactionName == 'close') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let beneficiary = helper.random(0, deployAccountCount);
      let ownerIndex = helper.random(0, deployAccountCount);
      let duration = helper.random(31, durationUpperBound+1);
      let goal = helper.random(goalLowerBound, goalUpperBound+1);
      let text = `close,constructor,,${goal} accounts[${beneficiary}],${ownerIndex},,false\nclose,increase,time,time.duration.days[${duration}],,,false\nclose,close,instance,,${ownerIndex},,true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }  


  if(transactionName == 'invest') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let beneficiary = helper.random(0, deployAccountCount);
      let ownerIndex = helper.random(0, deployAccountCount);
      let goal = helper.random(goalLowerBound, goalUpperBound+1);
      let investAccountIndex = helper.random(0, deployAccountCount);
      let investAmount = helper.random(investAmountLowerBound, investAmountUpperBound+1);
      let text = `invest,constructor,,${goal} accounts[${beneficiary}],${ownerIndex},,false\ninvest,invest,instance,,${investAccountIndex},web3.utils.toWei(${investAmount} ether),true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }

  // if(transactionName == 'claimRefund') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let beneficiary = helper.random(0, deployAccountCount);
  //     let ownerIndex = helper.random(0, deployAccountCount);
  //     let goal = helper.random(goalLowerBound, goalUpperBound+1);
  //     let investAccountIndex = helper.random(0, deployAccountCount);
  //     let investAmount = helper.random(investAmountLowerBound, investAmountUpperBound+1);
  //     let text = `claimRefund,constructor,,${goal} accounts[${beneficiary}],${ownerIndex},,false\nclaimRefund,invest,instance,,${investAccountIndex},web3.utils.toWei(${investAmount} ether),false\nclaimRefund,refund,instance,,${ownerIndex},,false\nclaimRefund,claimRefund,instance,accounts[${investAccountIndex}],,,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }

 

})
helper.runTests(transactionCounts, transactionFolders, testFolder, contractName)
