import {
    Meteor
} from "meteor/meteor";
import config from "../../modules/config/server";
import Blockcluster from "blockcluster";
import shortid from "shortid";
import {
    getBookingById
} from "../bookings/booking";
import { DriverMeta } from '../../collections/driver-meta/index';
import localizationManager from "../../ui/localization";

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
                message: localizationManager.strings.walletExists,
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

const getUserWallet = async (userId) => {
    try {
        userId = userId ? userId : Meteor.userId();
        console.log("Searching for user", userId);
        const res = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.Wallet,
                userId: userId.toString(),
                status: "open",
                active: true
            }
        });
        console.log("#1", res);
        if (res.length == 0) {
            throw {
                message: localizationManager.strings.unableToFindWallet,
            }
        } else {
            console.log("#2");
            return {
                success: true,
                wallet: res[0]
            }
        }
    } catch (ex) {
        console.log("getUserWallet", ex);
        return ex;
    }
}

const payUsingWallet = async (userId, amount, bookingId) => {
    try {
        let userWallet = await getUserWallet(userId);
        console.log("#3", userWallet);
        amount = parseInt(amount.toString());
        if (userWallet.success) {
            console.log("#4");
            let remainingAmount = 0;
            let amountDeducted = 0;
            let balance = parseInt(userWallet.wallet.balance.toString());

            if (balance >= amount) {
                console.log("#1.1");
                balance -= amount;
                amountDeducted = amount;
            } else {
                console.log("#1.2");
                remainingAmount = amount - balance;
                amountDeducted = balance;
                balance = 0;
            }

            let transactions = userWallet.wallet.transactions;
            transactions = transactions ? (transactions.length > 0 ? transactions : []) : [];
            transactions.push({
                type: "Debit",
                amount: amountDeducted,
                timestamp: +new Date(),
                bookingId: bookingId,
                type: "Payment"
            });

            console.log("#5");

            const txId = await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Wallet,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: userWallet.wallet.uniqueIdentifier,
                public: {
                    balance: balance,
                    transactions: JSON.stringify(transactions),
                }
            });

            console.log("#6");

            return {
                success: true,
                txnId: txId,
                remainingAmount: remainingAmount
            };
        } else {
            return userWallet;
        }
    } catch (ex) {
        console.log("pay using wallet", ex);
        return ex;
    }
}

const returnChangeToWallet = async (fare, amountPaid, bookingId) => {
    try {
        if (fare < amountPaid) {
            let booking = await getBookingById(bookingId);
            if (!booking || booking.message) {
                throw booking;
            } else {
                booking = booking.data;
                let wallet = await getUserWallet(booking.userId);
                if (wallet && wallet.success) {
                    wallet = wallet.wallet;
                    let balance = parseInt(wallet.balance.toString());
                    amountPaid = parseInt(amountPaid.toString());
                    fare = parseInt(fare.toString());
                    balance += (amountPaid - fare);

                    let transactions = wallet.transactions;
                    transactions = transactions ? (transactions.length > 0 ? transactions : []) : [];
                    transactions.push({
                        type: "Credit",
                        amount: (amountPaid - fare),
                        timestamp: +new Date(),
                        bookingId: bookingId,
                        type: "Change"
                    });

                    const txId = await node.callAPI("assets/updateAssetInfo", {
                        assetName: config.ASSET.Wallet,
                        fromAccount: node.getWeb3().eth.accounts[0],
                        identifier: wallet.uniqueIdentifier,
                        public: {
                            balance: balance,
                            transactions: JSON.stringify(transactions),
                        }
                    });

                    await DriverMeta.update(
                        {
                            driverId: booking.driverId
                        },
                        {
                            $inc: {
                                changeCollected: (amountPaid - fare)
                            }
                        }
                    );

                    return {
                        success: true,
                        txnId: txId
                    }

                } else {
                    throw wallet;
                }
            }
        } else {
            throw {
                message: localizationManager.strings.amountInsufficient
            }
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

export {
    createWallet,
    getUserWallet,
    payUsingWallet,
    returnChangeToWallet
};