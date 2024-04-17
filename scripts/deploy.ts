// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// const hre = require("hardhat");
import hre from "hardhat";

async function main() {
    const LoanAndSalaryAdvance = await hre.ethers.getContractFactory("LoanAndSalaryAdvance");
    const loanAndSalaryAdvance = await LoanAndSalaryAdvance.deploy("0x7624269a420c12395B743aCF327A61f91bd23b84");

    await loanAndSalaryAdvance.deployed();

    console.log(`LoanAndSalaryAdvance deployed to ${loanAndSalaryAdvance.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
