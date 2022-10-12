const { collectionDao } = require('../models/collectiondao');


class collectionApis {

    constructor() {
        this.initDao();
        // console.log('this.collectionDaothis.collectionDao', this.collectionDao);
    }
    async initDao() {
        this.collectionDao = await collectionDao.init();
    }
    async saveCollection(req, res) {
        const item = req.body;
        console.log('accessing saveCollection');
        let result = await this.collectionDao.addCollections(item);
        return result;
    }
    async getCollections(req, res) {
       try{
        const item = req.body;
        console.log('accessing saveCollection');
        let result = await this.collectionDao.getCollections(item);
        if(result != undefined && result.Success){
            res.status(200).json(result);
        }
       }
       catch(e){
        res.status(500).json({
            data: e,
            success: false
          });
       }
    }

    async getAuthenticatedCollections(req,res){
        try{
            const items = req.body;
            console.log('accessing saveCollection');
            let result = await this.collectionDao.getAuthenticatedCollections(items);
            if(result != undefined && result.Success){
                res.status(200).json(result);
            }
           }
           catch(e){
            res.status(500).json({
                data: e,
                success: false
              });
           }
    }
}

module.exports = {
    collectionApis
};