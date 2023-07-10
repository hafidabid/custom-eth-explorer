import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {makeRPCRequest} from "../helper/ethHelper";

export function TransactionComponent({ transaction, receipt }) {
    const {
        blockHash,
        blockNumber,
        from,
        gas,
        gasPrice,
        hash,
        input,
        nonce,
        to,
        value,
        v,
        r,
        s,
    } = transaction;

    const {
        contractAddress,
        cumulativeGasUsed,
        gasUsed,
        logs,
        status,
        transactionHash,
        transactionIndex,
    } = receipt;



    const isContractCreation = contractAddress !== null;
    const isContractCall = input !== '0x';
    const isEtherTransfer = !isContractCall;
    const isTokenTransfer = isContractCall && /^0xa9059cbb/.test(input); // The method signature of the `transfer` function of ERC20 tokens

    let transactionType;
    if (isContractCreation) {
        transactionType = 'Contract Creation';
    } else if (isTokenTransfer) {
        transactionType = 'Token Transfer';
    } else if (isContractCall) {
        transactionType = 'Contract Call';
    } else if (isEtherTransfer) {
        transactionType = 'Ether Transfer';
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl mb-4">Transaction Details</h1>
            <div className="bg-white rounded shadow-md p-4 mb-6">
                <h2 className="text-xl mb-2">Hash: {hash}</h2>
                <p>Block Hash: {blockHash}</p>
                <p>Block Number: {blockNumber}</p>
                <p>From: <a href={`/address/${from}`}>{from}</a></p>
                <p>To: <a href={`/address/${to}`}>{to}</a></p>
                <p>Value: {value}</p>
                <p>Gas: {gas}</p>
                <p>Gas Price: {gasPrice}</p>
                <p>Nonce: {nonce}</p>
                <p>v: {v}</p>
                <p>r: {r}</p>
                <p>s: {s}</p>
                <p>Type: {transactionType}</p>
                <p className="mt-4">Input Data</p>
                <textarea disabled className="w-full">{input}</textarea>
            </div>

            <h1 className="text-3xl mb-4">Receipt Details</h1>
            <div className="bg-white rounded shadow-md p-4 mb-6">
                <p>Contract Address: <a href={`/address/${contractAddress}`}>{contractAddress}</a></p>
                <p>Cumulative Gas Used: {cumulativeGasUsed}</p>
                <p>Gas Used: {gasUsed}</p>
                <p>Status: {status}</p>
                <p>Transaction Hash: {transactionHash}</p>
                <p>Transaction Index: {transactionIndex}</p>
                {logs.length > 0 && (
                    <div>
                        <h2 className="text-xl mb-2">Logs:</h2>
                        {logs.map((log, index) => (
                            <p key={index}>Log {index + 1}: {log}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function TxDetail(){
    const [txInfo, setTxInfo] = useState(null)
    const [txReceipt, setTxReceipt] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    useEffect(() => {
        if(router.isReady){
            const txId = router.query["txId"]
            if(!txId && router.isReady){
                alert("tx id UNDEFINED/NULL")
                window.location.replace("/")
                return
            }
            const run = async () =>{
                if (txId) {
                    const txDataResult = await makeRPCRequest("eth_getTransactionByHash",[txId] )
                    const txReceiptResult = await makeRPCRequest("eth_getTransactionReceipt",[txId])

                    if(!(txDataResult && txReceiptResult))
                        throw "can't find tx data in merkle tree, insert hash please!"

                    setTxInfo(txDataResult)
                    setTxReceipt(txReceiptResult)
                    console.log(txDataResult, txReceiptResult)
                }
            }

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
                       <TransactionComponent transaction={txInfo} receipt={txReceipt}/>
                   </>
                ) : <div>
                    <h2 className="text-xl font-bold mb-2">Loading ...</h2>
                </div>
            }
        </>
    )
}