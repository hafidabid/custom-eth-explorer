import axios from "axios";
import {AppConfig} from "../../app_config";

export async function makeRPCRequest(method, params) {
    try {
        const response = await axios.post(AppConfig.rpcUrl, {
            jsonrpc: "2.0",
            id: 1,
            method: method,
            params: params
        });

        if (response.data.error || response.status>299) {
            console.error("RPC Error: ", response.data.error);
            return null;
        }

        return response.data.result;
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

// Function to convert Hexadecimal to Integer
export function hexToInt(hexString) {
    return parseInt(hexString, 16);
}

// Function to convert Integer to Hexadecimal
export function intToHex(int) {
    return '0x' + int.toString(16);
}