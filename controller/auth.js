require('dotenv').config()
const jwt = require('jsonwebtoken')

const { usersDao } = require('../models/userdao');


class authApis {

    constructor() {
        this.initDao();
        console.log('this.usersDaothis.usersDao', this.usersDao);
    }
    async initDao() {
        this.usersDao = await usersDao.init();
    }
    async SignIn(req, res) {
        try {
            let userCredential = req.body;
            let result = await this.usersDao.findUser(userCredential);
            
            //return result;
            if (result != undefined && result.Success) {
                const accesstoken = this.generateAccessToken(result.Data);
                result.accesstoken = accesstoken;
                res.status(200).json(result);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                data: error,
                success: false
            });
        }
    }

    generateAccessToken(user){
        const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30s'});
        return accesstoken;
    }

}

module.exports = {
    authApis
};