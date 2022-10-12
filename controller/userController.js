const { usersDao } = require('../models/userdao');


class usersApis {

    constructor() {
        this.initDao();
        console.log('this.usersDaothis.usersDao', this.usersDao);
    }
    async initDao() {
        this.usersDao = await usersDao.init();
    }
    async createUser(req, res) {
        try {
            const item = req.body;
            console.log('accessing saveusers');
            let result = await this.usersDao.createUser(item);
            //return result;
            if (result != undefined && result.Success) {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({
                data: e,
                success: false
            });
        }
    }
    async getUsers(req, res) {
        try {
            const item = req.body;
            console.log('accessing getUSers');
            let result = await this.usersDao.getUsers(item);
            if (result != undefined && result.Success) {
                res.status(200).json(result);
            }
        }
        catch (e) {
            res.status(500).json({
                data: e,
                success: false
            });
        }
    }
}

module.exports = {
    usersApis
};