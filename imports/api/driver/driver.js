import Blockcluster from "blockcluster";
import {BookingRecord} from '../../collections/booking-record'
import config from "../../modules/config/server";
const node = new Blockcluster.Dynamo({
  locationDomain: config.BLOCKCLUSTER.host,
  instanceId: config.BLOCKCLUSTER.instanceId
});
