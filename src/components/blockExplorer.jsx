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
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}