import Blockcluster from "blockcluster";
import { getAllowdSOSCount } from "../sos/sos";
import config from "../../modules/config/server";

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const saveAndUpdate = async numbersArray => {
    const identifier = Meteor.userId();
    const data = {
        econtacts: JSON.stringify(numbersArray)
    };
    let txId;
    const count = await node.callAPI("assets/count", {
        assetName: config.ASSET.EMERGENCY_CONTACT,
        fromAccount: node.getWeb3().eth.accounts[0],
        toAccount: node.getWeb3().eth.accounts[0],
        identifier: identifier
    });
    if (count && !count.message) {
        //no count i.e create
        await node.callAPI("assets/issueSoloAsset", {
            assetName: config.ASSET.EMERGENCY_CONTACT,
            fromAccount: node.getWeb3().eth.accounts[0],
            toAccount: node.getWeb3().eth.accounts[0],
            identifier: identifier
        });
        txId = await node.callAPI("assets/updateAssetInfo", {
            assetName: config.ASSET.EMERGENCY_CONTACT,
            fromAccount: node.getWeb3().eth.accounts[0],
            identifier: identifier,
            public: data
        });
    } else {
        //just update numbers here
        txId = await node.callAPI("assets/updateAssetInfo", {
            assetName: config.ASSET.EMERGENCY_CONTACT,
            fromAccount: node.getWeb3().eth.accounts[0],
            identifier: identifier,
            public: data
        });
    }
    return txId;
};

const getContacts = async () => {
    const identifier = Meteor.userId();
    const existingData = await node.callAPI("assets/search", {
        $query: {
            uniqueIdentifier: identifier
        }
    });
    const { count } = await getAllowdSOSCount();
    return {
        ...existingData[0],
        count
    };
};
export { saveAndUpdate, getContacts };
