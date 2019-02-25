import Blockcluster from "blockcluster";
import config from "../../modules/config/server";
import { oneClickPayment } from '../payments/payments';
import { start } from "repl";

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const getSubscriptionPlans = async () => {
    try {
        const res = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.SubscriptionPlans,
            }
        });

        if (res.length > 0) {
            return {
                success: true,
                data: res
            };
        } else {
            throw {
                message: "No subscription plans available!"
            };
        }

    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const getUserSubscriptions = async (userId) => {
    try {
        const res = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.Subscriptions,
                userId: userId.toString(),
                active: true,
                status: "open",
            }
        });
        return {
            success: true,
            data: res
        };

    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

const subscribePlan = async ({
    planId,
    userId,
    hyperPayId
}) => {
    try {
        console.log(planId);
        console.log(userId);
        console.log(hyperPayId);
        let plan = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.SubscriptionPlans,
                uniqueIdentifier: planId.toString(),
            }
        });

        if (plan.length > 0) {
            plan = plan[0];

            console.log("Paying");

            var receipt = await oneClickPayment(plan.price, hyperPayId);

            //Handle payment failure
            console.log(receipt);

            const identifier =
                "I" +
                Date.now() +
                "" +
                Math.random()
                .toString()
                .split(".")[1]; //this is the Booking Id

            await node.callAPI("assets/issueSoloAsset", {
                assetName: config.ASSET.Subscriptions,
                fromAccount: node.getWeb3().eth.accounts[0],
                toAccount: node.getWeb3().eth.accounts[0],
                identifier: identifier
            });

            const today = new Date();
            const validTill = today.setDate(today.getDate() + parseInt(plan.validity));

            const txId = await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Subscriptions,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: identifier,
                public: {
                    userId: userId.toString(),
                    planId: planId.toString(),
                    active: true,
                    hyperPayId: hyperPayId,
                    startDate: (+new Date()).toString(),
                    validTill: (+validTill).toString(),
                }
            });
            return {
                success: true,
                data: txId
            };
        }
        throw {
            message: "Plan not found!"
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

const cancelSubscription = async (identifier) => {
    try {
        console.log("Canceling subscription", identifier);
        const res = await node.callAPI('assets/updateAssetInfo', {
            assetName: config.ASSET.Subscriptions,
            fromAccount: node.getWeb3().eth.accounts[0],
            identifier: identifier.toString(),
            public: {
                active: false
            }
        });
        console.log(res);
        return {
            success: true,
            txnHash: res
        }
    } catch (ex) {
        console.log(ex);
        return ex;
    }
};

const autoRenewal = async () => {
    try {
        console.log("Running subscription renewal job");
        let subscriptions = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.Subscriptions,
                active: true,
                status: "open"
            }
        });

        console.log("Total Subscription count:", subscriptions.length);

        let plan = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.SubscriptionPlans,
                status: "open"
            }
        });
        if (plan.length > 0) {
            plan = plan[0];
            console.log(plan);
        } else {
            console.log("Plan not found!");
            return;
        }
        let today = new Date();
        for (var i = 0; i < subscriptions.length; i++) {
            try {
                let validTill = new Date(subscriptions[i].validTill);
                console.log(validTill);
                console.log(validTill.getDate(), today.getDate(), validTill.getMonth(), today.getMonth(), validTill.getFullYear(), today.getFullYear());
                if (validTill.getDate() == today.getDate() && validTill.getMonth() == today.getMonth() && validTill.getFullYear() == today.getFullYear()) {
                    console.log("Payment ->", subscriptions[i].hyperPayId);
                    var receipt = await oneClickPayment(plan.price, subscriptions[i].hyperPayId);

                    //Handle payment failure
                    console.log(receipt);

                    let startDate = new Date();
                    let endDate = new Date().setDate(startDate.getDate() + parseInt(plan.validity));

                    let data = {
                        startDate: (+startDate).toString(),
                        validTill: (+endDate).toString()
                    }

                    let res = await node.callAPI('assets/updateAssetInfo', {
                        assetName: config.ASSET.Subscriptions,
                        fromAccount: node.getWeb3().eth.accounts[0],
                        identifier: subscriptions[i].uniqueIdentifier.toString(),
                        public: data
                    });
                    console.log(res);
                }

            } catch (ex) {
                console.log(subscriptions[i], ex);
            }
        }
    } catch (ex) {
        console.log(ex);
    }
}

export {
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan,
    cancelSubscription,
    autoRenewal
};