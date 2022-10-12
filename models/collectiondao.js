// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient
const { dbInit } = require('../db.connection');
// For simplicity we'll set a constant partition key
const partitionKey = undefined
class collectionDao {

    constructor(container) {
        this.container = container
    }

    static async init() {
        let container = await dbInit();
        return new collectionDao(container);
    }

    async find(querySpec) {
        if (!this.container) {
            throw new Error('Collection is not initialized.')
        }
        const { resources } = await this.container.items.query(querySpec).fetchAll()
        return resources
    }

    async addCollections(item) {
        let result = await this.saveData(item);
        return result;
    }

    // async updateItem(itemId) {
    //     const doc = await this.getItem(itemId)
    //     doc.completed = true

    //     const { resource: replaced } = await this.container
    //         .item(itemId, partitionKey)
    //         .replace(doc)
    //     return replaced
    // }

    async getAuthenticatedCollections(itemIds) {
        // const { resource } = await this.container.item(itemId, partitionKey).read()
        try {
            console.log('itemIDs', itemIds);
            let whereClause = 'AND c.id in ('
            if (Array.isArray(itemIds.items)) {
                itemIds.items.forEach((element, i) => {
                    whereClause += `'${element}'` + (i != itemIds.items.length - 1 ? ',' : ')');
                });
            }
            let querySpec = {
                query: "SELECT * FROM c WHERE c.___type=@type " + whereClause,
                parameters: [
                    {
                        name: "@type",
                        value: 'collection',
                    },
                ],
            };
            const { resources: queryData } = await this.container.items
                .query(querySpec)
                .fetchAll();
            console.log('itemssssss', queryData)
            if (queryData == null || queryData.length == 0) {
                return {
                    Success: true,
                    Data: null,
                    Message: "No Collection found",
                };
            } else {
                return {
                    Success: true,
                    Data: queryData,
                };
            }
            return queryData
        } catch (e) {
            return {
                Success: false,
                Message: e.message,
            };
        }
    }

    async getCollections() {
        try {
            const querySpec = {
                query: "SELECT * from c where c.___type=@type",
                parameters: [
                    {
                        name: "@type",
                        value: "collection",
                    },
                ],
            };
            const { resources: queryData } = await this.container.items.query(querySpec).fetchAll();
            if (queryData == null || queryData.length == 0) {
                return {
                    Success: true,
                    Data: null,
                    Message: "No Collection found",
                };
            } else {
                return {
                    Success: true,
                    Data: queryData,
                };
            }
        } catch (e) {
            return {
                Success: false,
                Message: e.message,
            };
        }
    }


    //////////////common func//////////////////////////


    async saveData(data) {
        try {
            let existData = await this.getDataDetails(data.___type, {
                id: data.id,
            });
            console.log('existtttttttttttttttt data', data.id, existData);
            let currentData = {};
            if (existData.Success && existData.Data != null) {
                currentData = existData.Data;
            }
            var fields, i;
            fields = Object.keys(data);
            for (i = 0; i < fields.length; i++) {
                currentData[fields[i]] = data[fields[i]];
            }

            if (existData.Success && existData.Data != null) {
                currentData = existData.Data;
            }
            let insetData;
            if (existData.Success && existData.Data != null) {
                insetData = await this.container.item(currentData.id).replace(currentData);
            } else {
                insetData = await this.container.items.create(currentData);
            }

            if (insetData.resource) {
                currentData = insetData.resource;
            } else {
                return {
                    Success: false,
                    Message: "Failed to save data",
                };
            }
            return {
                Success: true,
                Data: currentData,
                Message: data.___type + " saved",
            };
        } catch (error) {
            console.log(error);
            return {
                Success: false,
                Message: error,
            };
        }
    }
    async getFilteredData(pageSize, lastKey, type, filter, whereObj, orderBy) {
        try {
            if (type == "user" || type == "order" || type == "shipment" || type == "payment") {
                return {
                    Success: false,
                    Message: "Bad request",
                    Data: null,
                };
            }
            if (whereObj.___type) {
                return {
                    Success: false,
                    Message: "Bad request",
                    Data: null,
                };
            }

            if (lastKey == 0) lastKey = new Date().getTime();

            let whereClause = "";

            if (type) {
                whereClause = " AND c.___type='" + type + "'";
            }
            if (filter && filter.length > 0) {
                whereClause += " AND " + filter + " ";
            }

            if (whereObj) {
                for (let prop in whereObj) {
                    let valType = Object.prototype.toString.call(whereObj[prop]);
                    if (valType === "[object Number]" || valType === "[object Boolean]") whereClause += " AND c." + prop + "=" + whereObj[prop];
                    else whereClause += " AND c." + prop + "='" + whereObj[prop] + "'";
                }
            }

            let orderby = "";
            if (orderBy) {
                orderby = orderBy;
            } else {
                orderby = " ORDER BY c.lastModified DESC";
            }
            let querySpec = {
                query: "SELECT Top " + pageSize + " * FROM c WHERE c.lastModified < @lastKey " + whereClause + orderby,
                parameters: [
                    {
                        name: "@lastKey",
                        value: lastKey,
                    },
                ],
            };

            const { resources: items } = await this.container.items
                .query(querySpec, {
                    enableCrossPartitionQuery: true,
                    maxItemCount: pageSize,
                })
                .fetchAll();

            if (items != null && items.length > 0) {
                return {
                    Success: true,
                    Message: "Data Found",
                    Data: items,
                };
            } else {
                return {
                    Success: true,
                    Data: [],
                    Message: "No Data Found",
                };
            }
        } catch (e) {
            return {
                Success: false,
                Message: e.message,
            };
        }
    }

    async getDataDetails(type, whereObj) {
        try {
            let whereClause = "";

            if (whereObj) {
                for (let prop in whereObj) {
                    let valType = Object.prototype.toString.call(whereObj[prop]);
                    if (valType === "[object Number]" || valType === "[object Boolean]") whereClause += " AND c." + prop + "=" + whereObj[prop];
                    else whereClause += " AND c." + prop + "='" + whereObj[prop] + "'";
                }
            }

            // let querySpec = {
            //   query: "SELECT Top 1 * FROM c WHERE c.___type=@type ",
            //   parameters: [
            //     {
            //       name: "@type",
            //       value: type,
            //     },
            //   ],
            // };
            let querySpec = {
                query: "SELECT Top 1 * FROM c WHERE c.___type=@type " + whereClause,
                parameters: [
                    {
                        name: "@type",
                        value: type,
                    },
                ],
            };

            const { resources: items } = await this.container.items
                .query(querySpec, {
                    enableCrossPartitionQuery: true,
                    maxItemCount: 1,
                })
                .fetchAll();

            if (items && items.length > 0) {
                return {
                    Success: true,
                    Message: "Data Found",
                    Data: items[0],
                };
            } else {
                return {
                    Success: false,
                    Message: "No Data Found",
                    Data: null,
                };
            }
        } catch (e) {
            return {
                Success: false,
                Message: e.message,
            };
        }
    }

    //////////////common func end///////////////////////////

}

module.exports = {
    collectionDao,
}