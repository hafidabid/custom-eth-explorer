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