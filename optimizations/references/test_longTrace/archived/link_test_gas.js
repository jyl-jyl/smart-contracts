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

const lowerBound = 10;
const upperBound = 1000;

const testFolder = path.join(__dirname, `../tracefiles_long/link`);
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

  // if(transactionName == 'mint') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let constructorSenderIndex = helper.random(0, deployAccountCount);
  //     let mintAccountIndex = helper.random(0, deployAccountCount);
  //     let mintAmount = helper.random(lowerBound, upperBound+1);
  //     let text = `mint,constructor,,,${constructorSenderIndex},,false\nmint,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${constructorSenderIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }

  if(transactionName == 'approve') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let constructorSenderIndex = helper.random(0, deployAccountCount);
      let arrayRandom = [];
      for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
        if(appIndex != constructorSenderIndex) {
          arrayRandom.push(appIndex);
        }
      }
      let arrayRandomLen = arrayRandom.length;
      let approveAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let approveAmount_1 = helper.random(lowerBound, upperBound+1);
      let approveAmount_2 = helper.random(lowerBound, upperBound+1);
      let text = `approve,constructor,,,${constructorSenderIndex},,false\napprove,approve,instance,accounts[${approveAccountIndex}] ${approveAmount_1},${constructorSenderIndex},,false\napprove,approve,instance,accounts[${approveAccountIndex}] ${approveAmount_2},${constructorSenderIndex},,true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }  

  if(transactionName == 'increaseApproval') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let constructorSenderIndex = helper.random(0, deployAccountCount);
      let arrayRandom = [];
      for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
        if(appIndex != constructorSenderIndex) {
          arrayRandom.push(appIndex);
        }
      }
      let arrayRandomLen = arrayRandom.length;
      let approveAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let approveAmount = helper.random(lowerBound, upperBound+1);
      let increaseApprovalAmount_1 = helper.random(lowerBound, upperBound+1);
      let increaseApprovalAmount_2 = helper.random(lowerBound, upperBound+1);
      let text = `increaseApproval,constructor,,,${constructorSenderIndex},,false\nincreaseApproval,approve,instance,accounts[${approveAccountIndex}] ${approveAmount},${constructorSenderIndex},,false\nincreaseApproval,increaseApproval,instance,accounts[${approveAccountIndex}] ${increaseApprovalAmount_1},${constructorSenderIndex},,false\nincreaseApproval,increaseApproval,instance,accounts[${approveAccountIndex}] ${increaseApprovalAmount_2},${constructorSenderIndex},,true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }
  if(transactionName == 'decreaseApproval') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let constructorSenderIndex = helper.random(0, deployAccountCount);
      let arrayRandom = [];
      for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
        if(appIndex != constructorSenderIndex) {
          arrayRandom.push(appIndex);
        }
      }
      let arrayRandomLen = arrayRandom.length;
      let approveAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let approveAmount = helper.random(lowerBound, upperBound+1);
      let decreaseApprovalAmount_1 = helper.random(1, (approveAmount+1)/2);
      let decreaseApprovalAmount_2 = helper.random(1, (approveAmount+1)/2);
      let text = `decreaseApproval,constructor,,,${constructorSenderIndex},,false\ndecreaseApproval,approve,instance,accounts[${approveAccountIndex}] ${approveAmount},${constructorSenderIndex},,false\ndecreaseApproval,decreaseApproval,instance,accounts[${approveAccountIndex}] ${decreaseApprovalAmount_1},${constructorSenderIndex},,false\ndecreaseApproval,decreaseApproval,instance,accounts[${approveAccountIndex}] ${decreaseApprovalAmount_2},${constructorSenderIndex},,true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }


  // if(transactionName == 'burn') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let constructorSenderIndex = helper.random(0, deployAccountCount);
  //     let mintAccountIndex = helper.random(0, deployAccountCount);
  //     let mintAmount = helper.random(lowerBound, upperBound+1);
  //     let burnAmount  = helper.random(0, mintAmount+1);
  //     let text = `burn,constructor,,,${constructorSenderIndex},,false\nburn,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${constructorSenderIndex},,false\nburn,burn,instance,accounts[${mintAccountIndex}] ${burnAmount},${constructorSenderIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }  

  if(transactionName == 'transferFrom') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let constructorSenderIndex = helper.random(0, deployAccountCount);
      let transferAccountIndex = helper.random(0, deployAccountCount);
      let transferAmount = helper.random(lowerBound, upperBound+1);
      let arrayRandom = [];
      for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
        if(appIndex != transferAccountIndex) {
          arrayRandom.push(appIndex);
        }
      }
      let arrayRandomLen = arrayRandom.length;
      let approveAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let approveAmount = helper.random(2, transferAmount+1);
      let transferFromToAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let transferFromAmount_1 = helper.random(1, (approveAmount+1)/2);
      let transferFromAmount_2 = helper.random(1, (approveAmount+1)/2);
      let text = `transferFrom,constructor,,,${constructorSenderIndex},,false\ntransferFrom,transfer,instance,accounts[${transferAccountIndex}] ${transferAmount},${constructorSenderIndex},,false\ntransferFrom,approve,instance,accounts[${approveAccountIndex}] ${approveAmount},${transferAccountIndex},,false\ntransferFrom,transferFrom,instance,accounts[${transferAccountIndex}] accounts[${transferFromToAccountIndex}] ${transferFromAmount_1},${approveAccountIndex},,false\ntransferFrom,transferFrom,instance,accounts[${transferAccountIndex}] accounts[${transferFromToAccountIndex}] ${transferFromAmount_2},${approveAccountIndex},,true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }  

  if(transactionName == 'transfer') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let constructorSenderIndex = helper.random(0, deployAccountCount);
      let transferAccountIndex = helper.random(0, deployAccountCount);
      let transferAmount_1 = helper.random(lowerBound, upperBound+1);
      let transferAmount_2 = helper.random(lowerBound, upperBound+1);
      let text = `transfer,constructor,,,${constructorSenderIndex},,false\ntransfer,transfer,instance,accounts[${transferAccountIndex}] ${transferAmount_1},${constructorSenderIndex},,false\ntransfer,transfer,instance,accounts[${transferAccountIndex}] ${transferAmount_2},${constructorSenderIndex},,true\n`;
      fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }) 
  }

})
helper.runTests(transactionCounts, transactionFolders, testFolder, contractName)
