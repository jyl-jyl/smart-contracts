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

const dataLowerBound = 0;
const dataUpperBound = 9*(10**15);
const mintLowerBound = 10;
const mintUpperBound = 1000;
const mintIdUpperBound = 500;
const mintIdLowerBound = 1;
const uri = 'a_fake_uri';

const testFolder = path.join(__dirname, `../tracefiles_long/erc1155`);
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

  if(transactionName == 'burn') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let mintMsgSender = helper.random(0, deployAccountCount);
      let burnMsgSender = helper.random(0, deployAccountCount);
      let mintAccountIndex = helper.random(0, deployAccountCount);
      let mintAmount = helper.random(mintLowerBound, mintUpperBound+1);
      let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
      let mintData = helper.random(dataLowerBound, dataUpperBound);
      let burnAmount_1 = helper.random(1, (mintAmount+1)/2);
      let burnAmount_2 = helper.random(1, (mintAmount+1)/2);
      let text = `burn,constructor,,,${mintMsgSender},,false\nburn,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${mintMsgSender},,false\nburn,burn,instance,accounts[${mintAccountIndex}] ${burnAmount_1},${mintMsgSender},,false\nburn,burn,instance,accounts[${mintAccountIndex}] ${burnAmount_2},${mintMsgSender},,true\n`;
     if(!fs.existsSync(path.join(transactionFolderPath, fileName))) {
        console.log('generating new tracefiles ...');
        fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
          if (err) throw err;
          console.log('File is created successfully.');
        });
      }
    }) 
  }


  if(transactionName == 'mint') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let mintMsgSender = helper.random(0, deployAccountCount);
      let mintAccountIndex = helper.random(0, deployAccountCount);
      let mintAmount_1 = helper.random(mintLowerBound, mintUpperBound+1);
      let mintAmount_2 = helper.random(mintLowerBound, mintUpperBound+1);
      let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
      let mintData = helper.random(dataLowerBound, dataUpperBound);
      let text = `mint,constructor,,,${mintMsgSender},,false\nmint,mint,instance,accounts[${mintAccountIndex}] ${mintAmount_1},${mintMsgSender},,false\nmint,mint,instance,accounts[${mintAccountIndex}] ${mintAmount_2},${mintMsgSender},,true\n`;
     if(!fs.existsSync(path.join(transactionFolderPath, fileName))) {
        console.log('generating new tracefiles ...');
        fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
          if (err) throw err;
          console.log('File is created successfully.');
        });
      }
    }) 
  }

  // if(transactionName == 'transferFrom') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let mintMsgSender = helper.random(0, deployAccountCount);
  //     let owner = helper.random(0, deployAccountCount);
  //     let mintAccountIndex = helper.random(0, deployAccountCount);
  //     let mintAmount = helper.random(mintLowerBound, mintUpperBound+1);
  //     let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
  //     let mintData = helper.random(dataLowerBound, dataUpperBound);
  //     let arrayRandom = [];
  //     for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
  //       if(appIndex != mintAccountIndex) {
  //         arrayRandom.push(appIndex);
  //       }
  //     }
  //     let arrayRandomLen = arrayRandom.length;
  //     let setApprovalAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
  //     let safeTransferFromToAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
  //     let approveAmount = helper.random(0, mintAmount+1);
  //     let safeTransferFromAmount_1 = helper.random(1, (approveAmount+1)/2);
  //     let safeTransferFromAmount_2 = helper.random(1, (approveAmount+1)/2);
  //     let text = `transferFrom,constructor,,,${owner},,false\ntransferFrom,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${owner},,false\ntransferFrom,approve,instance,${mintId} accounts[${setApprovalAccountIndex}] ${approveAmount},${mintAccountIndex},,false\ntransferFrom,transferFrom,instance,${mintId} accounts[${mintAccountIndex}] accounts[${safeTransferFromToAccountIndex}] ${safeTransferFromAmount_1},${setApprovalAccountIndex},,false\ntransferFrom,transferFrom,instance,${mintId} accounts[${mintAccountIndex}] accounts[${safeTransferFromToAccountIndex}] ${safeTransferFromAmount_2},${setApprovalAccountIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }  

   if(transactionName == 'safeTransferFrom') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let mintMsgSender = helper.random(0, deployAccountCount);
      let mintAccountIndex = helper.random(0, deployAccountCount);
      let mintAmount = helper.random(mintLowerBound, mintUpperBound+1);
      let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
      mintId = 1;
      let mintData = helper.random(dataLowerBound, dataUpperBound);
      let arrayRandom = [];
      for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
        if(appIndex != mintAccountIndex) {
          arrayRandom.push(appIndex);
        }
      }
      let arrayRandomLen = arrayRandom.length;
      let setApprovalAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let safeTransferFromToAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let safeTransferFromAmount_1 = helper.random(1, (mintAmount+1)/2);
      let safeTransferFromAmount_2 = helper.random(1, (mintAmount+1)/2);
      let text = `safeTransferFrom,constructor,,${uri},,,false\nsafeTransferFrom,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${mintMsgSender},,false\nsafeTransferFrom,setApprovalForAll,instance,accounts[${setApprovalAccountIndex}] true,${mintAccountIndex},,false\nsafeTransferFrom,safeTransferFrom,instance,accounts[${mintAccountIndex}] accounts[${safeTransferFromToAccountIndex}] ${mintId} ${safeTransferFromAmount_1} ${mintData},${setApprovalAccountIndex},,false\nsafeTransferFrom,safeTransferFrom,instance,accounts[${mintAccountIndex}] accounts[${safeTransferFromToAccountIndex}] ${mintId} ${safeTransferFromAmount_2} ${mintData},${setApprovalAccountIndex},,true\n`;
     if(!fs.existsSync(path.join(transactionFolderPath, fileName))) {
        console.log('generating new tracefiles ...');
        fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
          if (err) throw err;
          console.log('File is created successfully.');
        });
      }
    }) 
  } 

  if(transactionName == 'setApprovalForAll') {
    tracefileCount = transactionCount;
    helper.range(tracefileCount).forEach(testFileIndex => {
      let fileName = `${transactionName}_${testFileIndex}.txt`;
      let mintMsgSender = helper.random(0, deployAccountCount);
      let mintAccountIndex = helper.random(0, deployAccountCount);
      let mintAmount = helper.random(mintLowerBound, mintUpperBound+1);
      let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
      let mintData = helper.random(dataLowerBound, dataUpperBound);
      let arrayRandom = [];
      for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
        if(appIndex != mintAccountIndex) {
          arrayRandom.push(appIndex);
        }
      }
      let arrayRandomLen = arrayRandom.length;
      let setApprovalAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
      let random_bin_1 = Math.random();
      let trueOrFalse_1;
      if(random_bin_1 < 0.5) {
        trueOrFalse_1 = 'true'
      } else {
        trueOrFalse_1 = 'false';
      }      
      let random_bin_2 = Math.random();
      let trueOrFalse_2;
      if(random_bin_2 < 0.5) {
        trueOrFalse_2 = 'true'
      } else {
        trueOrFalse_2 = 'false';
      }

      let text = `setApprovalForAll,constructor,,${uri},,,false\nsetApprovalForAll,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${mintMsgSender},,false\nsetApprovalForAll,setApprovalForAll,instance,accounts[${setApprovalAccountIndex}] ${trueOrFalse_1},${mintAccountIndex},,false\nsetApprovalForAll,setApprovalForAll,instance,accounts[${setApprovalAccountIndex}] ${trueOrFalse_2},${mintAccountIndex},,true\n`;
     if(!fs.existsSync(path.join(transactionFolderPath, fileName))) {
        console.log('generating new tracefiles ...');
        fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
          if (err) throw err;
          console.log('File is created successfully.');
        });
      }
    }) 
  }  

  // if(transactionName == 'approve') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let owner = helper.random(0, deployAccountCount);
  //     let mintMsgSender = helper.random(0, deployAccountCount);
  //     let mintAccountIndex = helper.random(0, deployAccountCount);
  //     let mintAmount = helper.random(mintLowerBound, mintUpperBound+1);
  //     let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
  //     let mintData = helper.random(dataLowerBound, dataUpperBound);
  //     let arrayRandom = [];
  //     for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
  //       if(appIndex != mintAccountIndex) {
  //         arrayRandom.push(appIndex);
  //       }
  //     }
  //     let arrayRandomLen = arrayRandom.length;
  //     let setApprovalAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
  //     let random_bin = Math.random();
  //     let trueOrFalse;
  //     if(random_bin < 0.5) {
  //       trueOrFalse = 'true'
  //     } else {
  //       trueOrFalse = 'false';
  //     }
  //     let approveAmount_1 = helper.random(1, (mintAmount+1)/2);
  //     let approveAmount_2 = approveAmount_1+ helper.random(0, (mintAmount+1)/2);
  //     let text = `approve,constructor,,,${owner},,false\napprove,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${owner},,false\napprove,approve,instance,${mintId} accounts[${setApprovalAccountIndex}] ${approveAmount_1},${setApprovalAccountIndex},,false\napprove,approve,instance,${mintId} accounts[${setApprovalAccountIndex}] ${approveAmount_2},${setApprovalAccountIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // }  


  // if(transactionName == 'transfer') {
  //   tracefileCount = transactionCount;
  //   helper.range(tracefileCount).forEach(testFileIndex => {
  //     let fileName = `${transactionName}_${testFileIndex}.txt`;
  //     let mintMsgSender = helper.random(0, deployAccountCount);
  //     let owner = helper.random(0, deployAccountCount);
  //     let mintAccountIndex = helper.random(0, deployAccountCount);
  //     let mintAmount = helper.random(mintLowerBound, mintUpperBound+1);
  //     let mintId = helper.random(mintIdLowerBound, mintIdUpperBound+2);
  //     // let mintData = helper.random(dataLowerBound, dataUpperBound);
  //     let arrayRandom = [];
  //     for (let appIndex = 0; appIndex < deployAccountCount; appIndex++) {
  //       if(appIndex != mintAccountIndex) {
  //         arrayRandom.push(appIndex);
  //       }
  //     }
  //     let arrayRandomLen = arrayRandom.length;
  //     let transferAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
  //     // let safeTransferFromToAccountIndex = arrayRandom[helper.random(0, arrayRandomLen)];
  //     let transferAmount_1 = helper.random(1, (mintAmount+1)/2);
  //     let transferAmount_2 = helper.random(1, (mintAmount+1)/2);
  //     // let safeTransferFromAmount= helper.random(0, approveAmount+1);
  //     let text = `transfer,constructor,,,${owner},,false\ntransfer,mint,instance,accounts[${mintAccountIndex}] ${mintAmount},${owner},,false\ntransfer,transfer,instance,${mintId} accounts[${transferAccountIndex}] ${transferAmount_1},${mintAccountIndex},,false\ntransfer,transfer,instance,${mintId} accounts[${transferAccountIndex}] ${transferAmount_2},${mintAccountIndex},,true\n`;
  //     fs.writeFileSync(path.join(transactionFolderPath, fileName), text, function (err) {
  //       if (err) throw err;
  //       console.log('File is created successfully.');
  //     });
  //   }) 
  // } 
    


})
helper.runTests(transactionCounts, transactionFolders, testFolder, contractName)
