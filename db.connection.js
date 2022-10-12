
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const dbContext = require("./data/databaseContext");
var container;

async function dbInit() {
    const { endpoint, key, databaseId, containerId } = config;
  
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    container = database.container(containerId);
    let d = new Date();
    // Make sure Tasks database is already setup. If not, create it.
    await dbContext.create(client, databaseId, containerId);

    return container;
  
  }
  
  
  
module.exports = {
    dbInit,
    container
}