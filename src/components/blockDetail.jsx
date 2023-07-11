import { useState, useEffect } from 'react';

import {useRouter} from "next/router";
import {hexToInt, makeRPCRequest} from "../helper/ethHelper";
import {AppConfig} from "../../app_config";

export function InsideBlock ({block}){
    const {
        hash,
        number,
        timestamp,
        miner,
        transactions,
        difficulty,
        gasLimit,
        gasUsed,
        commitTx,
        baseFeePerGas,
        verificationTx
    } = block;

    function getL1TxUrl(tx){
        const uri = AppConfig.l1Exploerer.replace(AppConfig.l1HashTemplate, tx)
        return uri
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl mb-4">Block Details</h1>
            <div className="bg-white rounded shadow-md p-4 mb-6">
                <h2 className="text-xl mb-2">Hash: {hash}</h2>
                <p>Number: {hexToInt(number)}</p>
                <p>Timestamp: {new Date(hexToInt(timestamp) * 1000).toLocaleString()}</p>
                <p>Miner: {miner}</p>
                <p>Gas Limit: {hexToInt(gasLimit)}</p>
                <p>Gas Used: {hexToInt(gasUsed)}</p>
                <p>Gas Price: {hexToInt(baseFeePerGas)}</p>
                <p>Tx Fee L1: {hexToInt(gasUsed) * hexToInt(baseFeePerGas) / Math.pow(10,9)} Gwei</p>
                <p>Transaction Rolled up: {transactions.length}</p>
                <p>L1 Commit Tx Hash: <a href={getL1TxUrl(commitTx)}>{commitTx}</a></p>
                <p>L1 Verify Tx Hash: <a href={getL1TxUrl(verificationTx)}>{verificationTx}</a></p>
            </div>

            <h2 className="text-2xl mb-4">Transactions</h2>
            {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                    <div key={index} className="bg-white rounded shadow-md p-4 mb-4">
                        <div>
                            <h3 className="text-lg mb-2">Transaction {index + 1}</h3>
                            <b>Hash: {tx.hash}</b>
                            <p>From: {tx.from}</p>
                            <p>To: {tx.to ?? `smart contract creation`}</p>
                            <p>Value: {tx.value}</p>
                        </div>

                        <div className="mt-6">
                            <a href={`/transaction/${tx.hash}`} className="bg-green-700 hover:bg-blue-700 text-white font-bold py-2 px-4 my-4 rounded">
                                Get Transaction Detail
                            </a>
                        </div>
                        {/* Display the other transaction data here */}
                    </div>
                ))
            ) : (
                <p>No transactions in this block.</p>
            )}
        </div>
    );
}

export default function BlockDetail() {
    // Converts the block's gasLimit and gasUsed from Wei to Ether for easier reading
    const [blockInfo, setBlockInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    useEffect(() => {
        if(router.isReady){
            const blockId = router.query["blockId"]
            console.log("rq",router.query)
            if(!blockId && router.isReady){
                alert("block id UNDEFINED/NULL")
                window.location.replace("/")
                return
            }
            const run = async () =>{
                if (blockId) {
                    const blockData = await makeRPCRequest("eth_getBlockByHash",[blockId, true] )

                    if(!blockData)
                        throw "can't find block data in merkle tree, insert hash please!"

                    setBlockInfo(blockData)
                    console.log(blockData)
                }
            }
            console.log("bid is", blockId)
            setLoading(true)
            run().then(()=>setLoading(false)).catch(e=>{
                alert(`error: ${e}`)
                window.location.replace("/")
                return
            })
        }

    }, [router.isReady]);

    return (
        <>
            {
                !loading? (
                    <>
                    <InsideBlock block={blockInfo}/>
                    </>
                ) : <div role="status">
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
            }
        </>
    )
}
