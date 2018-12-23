var MongoClient = require('mongodb').MongoClient;
var DbConnection = function() {

    var db = null;
    var instance = 0;

    async function DbConnect() {
        try {
            var path = `mongodb://natuan:123456@ds217310.mlab.com:17310/ban_dien_thoai`

            let url = path
            let _db = await MongoClient.connect(url);
            return _db.db("ban_dien_thoai")
        } catch (e) {
            return e;
        }
    }

    async function Get() {
        try {
            instance++; // this is just to count how many times our singleton is called.
            console.log(`số lượng gọi đến kết nối CSDL: ${instance} lần`);

            if (db != null) {
                console.log(`kết nối CSDL đã tồn tại`);
                return db;
            } else {
                console.log(`tạo một kết nối CSDL mới`);
                db = await DbConnect();
                return db;
            }
        } catch (e) {
            return e;
        }
    }

    return {
        Get: Get
    }
}


module.exports = DbConnection();