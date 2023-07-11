import { useEffect, useState } from 'react'
import {AppConfig} from "../../app_config";
import {hexToInt, intToHex, makeRPCRequest} from "../helper/ethHelper";

export default function Explorer() {
    const [blocks, setBlocks] = useState([])
    const [numOfBlock, setNumOfBlock] = useState(0)
    const [maxBlockInTable, setMaxBlockInTable] = useState(8)
    const [gasPrice, setGasPrice] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchBlocks() {
            const latestBlockNumber = await makeRPCRequest("eth_blockNumber", [])
            if(!latestBlockNumber)
                return

            const blockNumeric = hexToInt(latestBlockNumber)
            setNumOfBlock(blockNumeric)
            //console.log(latestBlockNumber, numOfBlock)

            const blocksTemporary = []
            let txs = []
            for (let i = blockNumeric; i >= blockNumeric-maxBlockInTable+1 && i>=0 ; i--) {
                const temporaryBlock = await makeRPCRequest("eth_getBlockByNumber", [intToHex(i), true])
                //console.log(temporaryBlock)
                blocksTemporary.push(temporaryBlock)

                txs = txs.concat(temporaryBlock.transactions)

            }

            const gpHex = await makeRPCRequest("eth_gasPrice", [])
            if(gpHex){
                setGasPrice(hexToInt(gpHex))
            }

            setTransactions(txs.slice(0,txs.length > 25 ? 25: txs.length))
            console.log(txs)
            setBlocks(blocksTemporary)
        }

        setIsLoading(true)
        fetchBlocks().finally(()=>setIsLoading(false))
    }, [maxBlockInTable])

    useEffect(()=>{
        const refreshFunc = async () => {
            if(isLoading)
                return

            console.log("running sync")
            const latestBlockNumber = await makeRPCRequest("eth_blockNumber", [])
            if(!latestBlockNumber)
                return

            const blockNumeric = hexToInt(latestBlockNumber)
            if(blockNumeric <= numOfBlock)
                return

            setNumOfBlock(blockNumeric)
            const blocksTemporary = []
            let txs = transactions
            for(let i = blockNumeric; i>numOfBlock; i--){
                const temporaryBlock = await makeRPCRequest("eth_getBlockByNumber", [intToHex(i), true])
                //console.log(temporaryBlock)
                blocksTemporary.push(temporaryBlock)

                txs = txs.concat(temporaryBlock.transactions)
            }

            const gpHex = await makeRPCRequest("eth_gasPrice", [])
            if(gpHex){
                setGasPrice(hexToInt(gpHex))
            }

            setTransactions(txs.concat(transactions).slice(0,txs.length > 25 ? 25: txs.length))
            setBlocks(blocksTemporary.concat(blocks).slice(0, maxBlockInTable))
        }

        const interval = setInterval( ()=>{
           refreshFunc()
        }, 2500)

        return ()=>{
            clearInterval(interval)
        }
    },[isLoading, maxBlockInTable])

    const handleClick = () => {
        setMaxBlockInTable(maxBlockInTable+5);
    };

    return (
        <div>
            <div className="container mx-auto p-4">
                {!isLoading ? (
                    <div>
                        <div className="container mx-auto px-4 py-8">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="p-4 bg-blue-600 rounded-lg shadow-md text-white">
                                    <h2 className="text-xl mb-2">Total Blocks</h2>
                                    <p className="text-4xl">{numOfBlock+1}</p>
                                </div>
                                <div className="p-4 bg-green-600 rounded-lg shadow-md text-white">
                                    <h2 className="text-xl mb-2">Gas Price</h2>
                                    <p className="text-4xl">{gasPrice} Wei</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                    <tr className="text-white bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
                                        <th className="px-4 py-2">Block Number</th>
                                        <th className="px-4 py-2">Hash</th>
                                        <th className="px-4 py-2">Timestamp</th>
                                        <th className="px-4 py-2">Batch Tx</th>
                                        <th className="px-4 py-2">Commit</th>
                                        <th className="px-4 py-2">Verified</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {blocks.map((block, index) => (
                                        <tr key={index} className={`bg-white ${index % 2 === 0 ? 'bg-gray-100' : ''}`}>
                                            <td className="px-4 py-2 border border-gray-300"><a href={`/block/${block.hash}`}>{block.number}</a></td>
                                            <td className="px-4 py-2 border border-gray-300"><a href={`/block/${block.hash}`}>{block.hash}</a></td>
                                            <td className="px-4 py-2 border border-gray-300">{new Date(block.timestamp * 1000).toLocaleString()}</td>
                                            <td className="px-4 py-2 border border-gray-300">{block.transactions.length}</td>
                                            <td className="px-4 py-2 border border-gray-300">{block.commitTx && block.commitTx.length > 4 ? "OK" : "NOT OK"}</td>
                                            <td className="px-4 py-2 border border-gray-300">{block.
                                                verificationTx && block.
                                                verificationTx.length > 4 ? "OK" : "NOT OK"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <button onClick={handleClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Show me 5 more :)
                            </button>
                        </div>

                        <div className="container mx-auto px-4 py-8">
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                    <tr className="text-white bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
                                        <th className="px-4 py-2">Transaction Hash</th>
                                        <th className="px-4 py-2">From</th>
                                        <th className="px-4 py-2">To</th>
                                        <th className="px-4 py-2">Value (ETH)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.map((tx, index) => (
                                        <tr key={index} className={`bg-white ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                            <td className="px-4 py-2 border border-gray-300"><a href={`/transaction/${tx.hash}`}>{tx.hash}</a></td>
                                            <td className="px-4 py-2 border border-gray-300"><a href={`/address/${tx.from}`}>{tx.from}</a></td>
                                            <td className="px-4 py-2 border border-gray-300"><a href={`/address/${tx.to ?? ''}`}>{tx.to ??  "Contract creation"}</a></td>
                                            <td className="px-4 py-2 border border-gray-300">{(hexToInt(tx.value)/(Math.pow(10, 18)))}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                ) : (
                    <div role="status">
                        <svg aria-hidden="true"
                             className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                )}
            </div>
        </div>
    )
}