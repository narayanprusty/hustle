import Blockcluster from "blockcluster";
import config from "../../modules/config/server";


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
            }
        });

        if (res.length > 0) {
            return {
                success: true,
                data: res
            };
        } else {
            throw {
                message: "No plans found!"
            };
        }

    } catch (ex) {
        console.log(ex);
        return ex;
    }
}

const subscribePlan = async (planId, userId) => {
    try {

        const plan = await node.callAPI('assets/search', {
            $query: {
                assetName: config.ASSET.SubscriptionPlans,
                uniqueIdentifier: planId.toString(),
            }
        });

        if (plan.length > 0) {

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
            const validTill = today.setDate(today.getDate() + parseInt(plan[0].validity));

            const txId = await node.callAPI("assets/updateAssetInfo", {
                assetName: config.ASSET.Subscriptions,
                fromAccount: node.getWeb3().eth.accounts[0],
                identifier: identifier,
                public: {
                    userId: userId.toString(),
                    planId: planId.toString(),
                    active: true,
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

export {
    getSubscriptionPlans,
    getUserSubscriptions,
    subscribePlan,
};