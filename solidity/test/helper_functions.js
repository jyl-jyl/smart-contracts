const fs = require('fs');
const path = require('path');
const {
  time, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
function range(n) {
	return [...Array(n).keys()];
}

function random(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

function runTests(transactionCounts, transactionFolders, testFolder, contractName) {
  var Contract = artifacts.require(contractName);
  contract(`${contractName}`, accounts => {
    range(transactionCounts).forEach(async(l) => {
        var transactionName = transactionFolders[l];
        console.log('transaction name: ', transactionName);
        const transactionFolderPath = path.join(testFolder, `/${transactionName}`);
        // get all files in the transaction folder
        const filesInTransaction = fs.readdirSync(transactionFolderPath, 'utf-8');
        // read setup
        const setupPath = path.join(transactionFolderPath, '/setup.txt');
        // transaction count default to 1
        var transactionCount; /*= filesInTransaction.length-2*/
        var aggregationMethod = 'average';
        // parsing setup.txt
        if (fs.existsSync(setupPath)) {
          console.log('setup exists');
          const setupFS = fs.readFileSync(setupPath, 'utf-8');
          const setupLines = setupFS.split(/\r?\n/);
          let i = 0;
          while(i < setupLines.length) {
            let sl = setupLines[i];
            if(sl.startsWith('method')) {
              aggregationMethod = sl.split(',')[1];
            }
            if (sl.startsWith('nt')) {
              transactionCount = +sl.split(',')[1];
            }
            i++;
          }
        }
        console.log('transaction count: ', transactionCount); 
        it(`Testing ${contractName}.${transactionName} gas consumption`, async() => {
          var resultTotal = 0;
          var resultArr = [];
          var instance;
          var line;
          var fromAccountIndex = -1;
          var valueTran = -1;
          var currentFuncName;
          var currentCallFrom;

          for (let i = 0; i < transactionCount; i++) {
            // get the tracefile based on the index
            var traceFileName = `${transactionName}_${i.toString()}.txt`;
            if(!traceFileName.startsWith(transactionName)) {
              continue;
            }
            const transactionFS = fs.readFileSync(path.join(transactionFolderPath, `./${traceFileName}`), 'utf-8');

            const lineArr = transactionFS.split(/\r?\n/);
            const lineCount = lineArr.length;

            for(let j = 0; j < lineCount; j++) {
              line = lineArr[j];
              console.log(line);
              // split each line by comma
              const eachLineArr = line.split(',');
              var argArr = [];
              var argsCount;
              if(line != '') {
                // console.log(line);
                if(eachLineArr[3] != '') {
                  argArr = eachLineArr[3].split(' ');
                }
                argsCount = argArr.length;
                // convert args for the function to the correct data type

                if(argsCount > 0) {
                  for(let n = 0; n < argsCount; n++) {
                    let ele = argArr[n];
                    if(!isNaN(ele)) {
                      argArr[n] = +ele;
                    }
                    if(ele.startsWith('accounts')) {
                      let init = ele.indexOf('[');
                      let fin = ele.indexOf(']');
                      let accountsNum = +ele.substr(init+1,fin-init-1);
                      argArr[n] = accounts[accountsNum];
                    }
                    if(ele == 'emptyArr') {
                      let emptyArr = [];
                      argArr[n] = emptyArr;
                    }
                  }
                }

                if (eachLineArr[4] != '') {
                  fromAccountIndex = +eachLineArr[4];
                }
                if (eachLineArr[5] != '') {
                  if(eachLineArr[5].startsWith('web3.utils.toWei')) {
                    let valueStr = eachLineArr[5];
                    let parentOpen = valueStr.indexOf('(');
                    let parentClose = valueStr.indexOf(')');
                    let insideParent = valueStr.substr(parentOpen+1,parentClose-parentOpen-1);
                    let insideParentArr = insideParent.split(' ');
                    valueTran = web3.utils.toWei(insideParentArr[0], insideParentArr[1]);
                  } else {
                    valueTran = +eachLineArr[5];
                  }
                } 
                // call constructor
                if(eachLineArr[1] == 'constructor') {
                  if(fromAccountIndex != -1 && valueTran!= -1) {
                    // console.log('from + value');
                    instance = await Contract.new(...argArr, {from: accounts[fromAccountIndex], value: valueTran});
                  } else if(fromAccountIndex != -1) {
                    // console.log('from ');
                    instance = await Contract.new(...argArr, {from: accounts[fromAccountIndex]});
                  } else if(valueTran != -1) {
                    // console.log('value');
                    instance = await Contract.new(...argArr, {value: valueTran});
                  } else {
                    // console.log('neither from + value');
                    instance = await Contract.new(...argArr);
                  }  
                }
                // call transaction
                else if(eachLineArr[6].startsWith('true')) {
                  var result;
                  if(fromAccountIndex != -1 && valueTran!= -1) {
                    result = await instance[transactionName](...argArr, {from: accounts[fromAccountIndex], value: valueTran});
                  } else if(fromAccountIndex != -1) {
                    result = await instance[transactionName](...argArr, {from: accounts[fromAccountIndex]});
                  } else if(valueTran != -1) {
                    result = await instance[transactionName](...argArr, {value: valueTran});
                  } else {
                    result = await instance[transactionName](...argArr);
                  }   
                  let gasUsed = await result.receipt.gasUsed;
                  resultTotal += gasUsed;
                  resultArr.push(gasUsed);
                  console.log(`Gas used by ${contractName}.${transactionName} (test ${i}): `, gasUsed, '\n');                    
                }
                // call intermediate functions
                else {
                  currentFuncName = eachLineArr[1];
                  currentCallFrom = eachLineArr[2];
                  // if called from previous instance of the contract
                  if(currentCallFrom == 'instance') {
                    // console.log('calling intance ...');
                    if(fromAccountIndex != -1 && valueTran!= -1) {
                      // console.log('from + value');
                      await instance[currentFuncName](...argArr, {from: accounts[fromAccountIndex], value: valueTran});
                    } else if(fromAccountIndex != -1) {
                      // console.log('from ');
                      await instance[currentFuncName](...argArr, {from: accounts[fromAccountIndex]});
                    } else if(valueTran != -1) {
                      // console.log('value');
                      await instance[currentFuncName](...argArr, {value: valueTran});
                    } else {
                      // console.log('neither from + value');
                      await instance[currentFuncName](...argArr);
                    }                  
                  }
                  // if others
                  else if (currentCallFrom == 'time') {
                    // get the time to increase
                    let bracketOpen = eachLineArr[3].indexOf('[');
                    let bracketClose = eachLineArr[3].indexOf(']');
                    let timeValue = +eachLineArr[3].substr(bracketOpen+1,bracketClose-bracketOpen-1);
                    // console.log(timeValue);
                    const timeUnit = eachLineArr[3].split('.')[2];
                    if(timeUnit.startsWith('seconds')) {
                      await time[currentFuncName](time.duration.seconds(timeValue));
                    }
                    if(timeUnit.startsWith('days')) {
                      await time[currentFuncName](time.duration.days(timeValue));
                    }

                  }
                }
                // reset value for 'from' and 'value'
                fromAccountIndex = -1;
                valueTran = -1;
              }
            }
          }
          // calculate aggregation
          var gasUsedAgg;
          if(aggregationMethod == 'average') {
            gasUsedAgg =  resultTotal / transactionCount;
          }
          console.log(`${contractName}.${transactionName} Gas Used (${aggregationMethod}): `, gasUsedAgg);
        }) 
      })

  })
}

module.exports = { range, random, runTests };







