import {
    Meteor
} from "meteor/meteor";
import config from "../../modules/config/server";
import Blockcluster from "blockcluster";
import shortid from "shortid";
import { getBookingById } from "../bookings/booking";

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const createWallet = async () => {
    try {
        let userId = Meteor.userId();
        const res = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.Wallet,
                userId: userId.toString(),
                status: "open",
                active: true
            }
        });
        if (res.length > 0) {
            throw {
                message: "Wallet already exists!"
            }
        } else {
            let identifier = shortid.generate();

            await node.callAPI("assets/issueSoloAsset", {
                assetName: config.ASSET.Wallet,
                fromAccount: node.getWeb3().eth.accounts[0],
                toAccount: node.getWeb3().eth.accounts[0],
                identifier: identifier
            });

            const txId = await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Wallet,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: identifier,
                public: {
                    userId: userId.toString(),
                    balance: 0,
                    transactions: JSON.stringify([]),
                    active: true,
                }
            });

            console.log("Wallet created for user", userId, txId);

            return {
                success: true,
                txnId: txId
            }
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

const getUserWallet = async () => {
    try {
        let userId = Meteor.userId();
        const res = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.Wallet,
                userId: userId.toString(),
                status: "open",
                active: true
            }
        });
        if (res.length == 0) {
            throw {
                message: "Unable to find wallet!"
            }
        } else {
            return {
                success: true,
                wallet: res[0]
            }
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

const payUsingWallet = async (amount, bookingId) => {
    try {
        let userWallet = this.getUserWallet();
        if (userWallet.success) {
            let balance = parseInt(userWallet.wallet.balance.toString());
            if (balance >= amount) {
                balance -= amount;
                let transactions = userWallet.wallet.transactions;
                transactions = transactions ? (transactions.length > 0 ? transactions : []) : [];
                transactions.push({
                    type: "Debit",
                    amount: amount,
                    timestamp: +new Date(),
                    bookingId: bookingId
                });

                const txId = await node.callAPI("assets/updateAssetInfo", {
                    assetName: config.ASSET.Wallet,
                    fromAccount: node.getWeb3().eth.accounts[0],
                    identifier: userWallet.wallet.uniqueIdentifier,
                    public: {
                        balance: balance,
                        transactions: JSON.stringify(transactions),
                    }
                });

                return {
                    success: true,
                    txnId: txId
                };
            } else {
                throw {
                    message: "Insufficient balance!"
                }
            }
        } else {
            return userWallet;
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

// const returnChangeToWallet = async (fare, amountPaid, bookingId) => {
//     try {
//         if(fare < amountPaid){
//             let booking = await getBookingById(bookingId);
//             if(!booking || booking.message){
//                 throw {
//                     message: "Booking not found!"
//                 }
//             } else {
//                 booking = booking.data;

//             }
//         } else {
//             throw {
//                 message: ""
//             }
//         }
//     } catch(ex) {
//         console.log(ex);
//         return ex;
//     }
// }

export {
    createWallet,
    getUserWallet,
    payUsingWallet,
};