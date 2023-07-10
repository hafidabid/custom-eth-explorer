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
                ) : <div>
                    <h2 className="text-xl font-bold mb-2">Loading ...</h2>
                </div>
            }
        </>
    )
}
