import Blockcluster from "blockcluster";
import config from "../../modules/config/server";

const node = new Blockcluster.Dynamo({
    locationDomain: config.BLOCKCLUSTER.host,
    instanceId: config.BLOCKCLUSTER.instanceId
});

const getAllowdSOSCount = async () => {
    try{
        let settings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.GlobalSettings,
                status: "open"
            },
        });
        return {
            success: true,
            count: settings.count > 0 ? (settings[0].SOSCount ? settings[0].SOSCount : 5) : 5
        }
    }catch(ex){
        console.log(ex);
        return ex;
    }
}

const getSOSNumbers = async () => {
    try{
        let settings = await node.callAPI("assets/search", {
            $query: {
                assetName: config.ASSET.GlobalSettings,
                status: "open"
            },
        });
        return {
            success: true,
            count: settings.count > 0 ? (settings[0].SOSNumbers ? settings[0].SOSNumbers : []) : []
        }
    }catch(ex){
        console.log(ex);
        return ex;
    }
}

export {
    getAllowdSOSCount,
    getSOSNumbers
};
