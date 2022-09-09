// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

 /* 
Multisig wallet 
 - Quorum should always be a majority
 - Only contract owner can add signers
 - Signers and contract owner can 
   a. Submit transactions for approval 
   b. View pending transaction 
   c. Approve and revoke pending transactions
   d. If quorum is met, contract owner or any of the signers can execute the transactions. 
- Types of transactions 
   a. Sending ETH 
   b. Sending ERC20(create a basic ERC20) 
*/          

import  "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Contract for token creation 
contract Token_Generation is ERC20 , Ownable{

// Name the token 
constructor () ERC20("MyToken","MTK"){

}
// Create Basic Token for The MultiSig Transaction
function mint(address _to , uint _amountToken) public onlyOwner {
    require(_amountToken > 0 );
    _mint(_to, _amountToken);
}
}


// Contract for the Multi SIgnature
contract Multi_Signature is Ownable , AccessControl {

//Define ENUM for type of Transaction 
enum typeCoin { E20 , ETH}

uint public totalSigner;
uint public quorumMajority;
// Initializing/Defining the Signer Role
bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE"); 


//Create a Transaction Object to be passed on transaction mapping for storing
struct Transaction {
    address recipient;
    uint amountERC;
    uint amountETH;
    typeCoin coinType;
    uint approve;
    uint reject;
    mapping(address => bool) isVoter;
    bool complete;
    address linkERCtoETHAddress;

}
uint public transactionNumber;
mapping(uint => Transaction ) private listOfTransaction;
modifier roleAccepted () {
    require(hasRole(SIGNER_ROLE,msg.sender) || msg.sender == owner());
    _;
}
// Set on Deploy the Quorum Majority
 constructor(uint _quorumMajority) payable {
        setQuorumMajority(_quorumMajority);
    }
function isTransactionCompleted(uint _transactionID) public view returns(bool){
    Transaction storage transaction = listOfTransaction[_transactionID];
    
    return transaction.complete;
}
// To be dynamic base on user requirement should be 50 % and above
function setQuorumMajority(uint _quorumMajority) public onlyOwner {
    // Condition for setting the quorum majority
        require(_quorumMajority >= 50, "Given value too low (50 - 100)");
        require(_quorumMajority <= 100, "Given value too high (100 - 100)");
        quorumMajority = _quorumMajority;
}

// Adding Signer Role. Only Contract owner can do this
function addSigners(address _Signers) public onlyOwner{
    _grantRole(SIGNER_ROLE, _Signers);
    totalSigner += 1;
}
// Remove Signer Role. Only Contract owner can do this
function removeSigners(address _Signers) public onlyOwner{
    _revokeRole(SIGNER_ROLE, _Signers);
    totalSigner -= 1;
}


// Submit Transaction for Approval ETH
function createTransactionETH(address _recipient ,uint _amount  ) public roleAccepted()   {
Transaction storage requestTransaction = listOfTransaction[transactionNumber];
transactionNumber++;
requestTransaction.recipient = _recipient;
requestTransaction.amountETH = _amount;
requestTransaction.coinType = typeCoin.ETH;
}
// Submit Transaction for Approval ERC20
function createTransactioERC20(address _recipient ,uint _amount , address _linkERCtoETHAddress) public roleAccepted()  {
Transaction storage requestTransaction = listOfTransaction[transactionNumber];
transactionNumber++;
requestTransaction.recipient = _recipient;
requestTransaction.amountERC = _amount;
requestTransaction.coinType = typeCoin.E20;
requestTransaction.linkERCtoETHAddress = _linkERCtoETHAddress;
}
// Fetch the Number of Signer
function getTransactionCount() public roleAccepted() view returns (uint) {
        return totalSigner;
}

// View the transaction
function viewTransactions(uint _transactionId) public roleAccepted()  view returns 
    (
        address,
        uint,
        uint,
        typeCoin,
        uint,
        uint,
        bool
    ) {
        require(_transactionId < transactionNumber, "Transaction id is out of range");
        Transaction storage targetTransaction = listOfTransaction[_transactionId];
        return (
            targetTransaction.recipient, 
            targetTransaction.amountERC,
            targetTransaction.amountETH, 
            targetTransaction.coinType, 
            targetTransaction.approve, 
            targetTransaction.reject, 
            targetTransaction.complete
        );
    }

// Voting mechanism
function approveTransaction(uint _transactionId) public roleAccepted() {
Transaction storage vote =  listOfTransaction[_transactionId];
require(vote.isVoter[msg.sender] == false , "You voted already");
vote.isVoter[msg.sender] == true;
vote.approve++;

}
// Revoking evoking the vote
function revokeTransaction(uint _transactionId) public roleAccepted() {
Transaction storage vote =  listOfTransaction[_transactionId];
require(vote.isVoter[msg.sender] == true , "You voted already");
vote.isVoter[msg.sender] == false;
vote.approve--;

}
// Execute the transaction with require
function finalizeTransaction(uint _transactionId) public roleAccepted() {
Transaction storage targetTransaction = listOfTransaction[_transactionId];
require(targetTransaction.complete == false , "This transaction ID is already done");
require(targetTransaction.approve / totalSigner * 100 > quorumMajority, "Percentage/Quorum Majority is not met");


if (targetTransaction.coinType == typeCoin.E20) {
            IERC20(targetTransaction.linkERCtoETHAddress).transfer(targetTransaction.recipient, targetTransaction.amountERC);
        } else {
            payable(targetTransaction.recipient).transfer(targetTransaction.amountETH);
        }

        targetTransaction.complete = true;
}

function supplyETH() public payable {

}

// listending Transaction
/*function viewPendingTransaction() public view returns(){

}

// Approve a Transaction
function approveTrasanction () public onlyOwner {

}

*/
}