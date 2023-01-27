import { getNodeVersionSchedule } from "./index.js";

const versions = await getNodeVersionSchedule();

console.log(versions);