var express = require('express');
var router = express.Router();

var xl_mongo = require('../public/xu_ly/XL_LUU_TRU_MONGO');
//var Du_lieu = {}
//var proCuahang = xl_mongo.ds_doi_tuong("Cua_hang")
//var proDienthoai = xl_mongo.ds_doi_tuong("Dien_thoai")

//proCuahang.then(result => {
//   Du_lieu.Cua_hang = result[0]
//   console.log(result[0])
//}).catch(err => {

//})
//proDienthoai.then(result => {
//  Du_lieu.Danh_sach_Dien_thoai = result
//})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('trangchu', { tieude: 'Trang chủ', ds_dien_thoai: Du_lieu.Danh_sach_Dien_thoai });
});

router.get('/iphone', function(req, res, next) {
    var ds_iphone = Du_lieu.Danh_sach_Dien_thoai.filter(x => x.Nhom_Dien_thoai.Ma_so == `IPHONE`)
    res.render('trangchu', { tieude: 'Trang chủ', ds_dien_thoai: ds_iphone });
});

router.get('/android', function(req, res, next) {
    var ds_iphone = Du_lieu.Danh_sach_Dien_thoai.filter(x => x.Nhom_Dien_thoai.Ma_so == `ANDROID`)
    res.render('trangchu', { tieude: 'Trang chủ', ds_dien_thoai: ds_iphone });
});

router.post('/tim_kiem', function(req, res, next) {
    var gtTim = req.body.q.trim()


    var ds = Du_lieu.Danh_sach_Dien_thoai.filter(x => x.Ten.toLocaleLowerCase().includes(gtTim.toLocaleLowerCase()))
    res.render('trangchu', {
        tieude: "Trang chu",
        Cua_hang: Du_lieu.Cua_hang,
        ds_dien_thoai: ds,
    });
});

router.get(`/:Ten/:Ma_so`, function(req, res, next) {
    var Ma_so = req.params.Ma_so
    var dien_thoai = Du_lieu.Danh_sach_Dien_thoai.find(x => x.Ma_so == `${Ma_so}`)
    res.render('chitiet', {
        tieude: "Chi tiet",
        Cua_hang: Du_lieu.Cua_hang,
        ds_dien_thoai: dien_thoai
    });
})

router.get("/sap-tang", function(req, res, next) {
    var dsSap_xep_gia_tang = Du_lieu.Danh_sach_Dien_thoai.sort((a, b) => {
        return Number(a.Don_gia_Ban) - Number(b.Don_gia_Ban)
    })

    //var dsSap_xep_ten_tang=Du_lieu.Danh_sach_Dien_thoai.sort((a, b) => a.Ten.localeCompare(b.Ten))

    res.render('trangchu', {
        tieude: " Loc du lieu",
        Cua_hang: Du_lieu.Cua_hang,
        ds_dien_thoai: dsSap_xep_gia_tang

    });
})

router.get("/sap-giam", function(req, res, next) {
    // Du_lieu.Danh_sach_Dien_thoai.sort((a,b)=>{
    //     //return b.Don_gia_Ban-a.Don_gia_Ban
    // })
    res.render('trangchu', {
        tieude: "Loc du lieu sw",
        Cua_hang: Du_lieu.Cua_hang,
        ds_dien_thoai: Du_lieu.Danh_sach_Dien_thoai.sort((a, b) => b.Ten.localeCompare(a.Ten))
            //current: page,
            //pages: 0
            //pages: Math.ceil(count / limit) 
    });

})

// Giỏ hàng của bạn
router.post('/them-gio-hang', function(req, res) {
    // Thêm vào giỏ
    var Dien_thoai = Du_lieu.Danh_sach_Dien_thoai.find(x => x.Ma_so == req.body.Ma_so);
    var Dien_thoai_tmp = {
        Ma_so: Dien_thoai.Ma_so,
        Ten: Dien_thoai.Ten,
        Nhom_Dien_thoai: Dien_thoai.Nhom_Dien_thoai.Ma_so,
        So_luong: req.body.So_luong,
        Don_gia_Ban: Number(Dien_thoai.Don_gia_Ban),
        Thanh_tien: req.body.So_luong * Number(Dien_thoai.Don_gia_Ban)
    }

    var ds = []

    if (typeof req.gio_hang.Gio_hang !== "undefined") {
        ds = req.gio_hang.Gio_hang
        var kiem_tra = 0
        ds.forEach(function(dt) {
            if (dt.Ma_so == Dien_thoai.Ma_so) {
                dt.So_luong = req.body.So_luong
                dt.Thanh_tien = req.body.So_luong * Number(Dien_thoai.Don_gia_Ban)
                kiem_tra = 1
            }
        })
        if (kiem_tra == 0) {
            ds.push(Dien_thoai_tmp)
        }
    } else {
        ds.push(Dien_thoai_tmp)
    }


    req.gio_hang.Gio_hang = ds
    res.send(JSON.stringify(req.gio_hang.Gio_hang))
})


router.get('/xem-gio-hang', function(req, res) {
    res.render('xemgiohang', {
        Cua_hang: Du_lieu.Cua_hang,

    });
})

// Xử lý Xóa giỏ hàng
router.get('/xoa-gio-hang', function(req, res) {
    req.gio_hang.reset()
        //req.gio_hang.Gio_hang = null;
        //res.locals.Gio_hang = req.gio_hang.Gio_hang
    res.redirect('/');
})

// Xử lý Khách đặt hàng
router.post('/khach-dat-hang', function(req, res) {

    var dsDat = req.body
    dsDat.forEach(p => {
        var Dien_thoai = Du_lieu.Danh_sach_Dien_thoai.find(x => x.Ma_so == p.Ma_so)
        var So_Phieu_Dat = Dien_thoai.Danh_sach_Phieu_Dat.length + 1
        p.Phieu_Dat.So_Phieu_Dat = So_Phieu_Dat
        Dien_thoai.Danh_sach_Phieu_Dat.push(p.Phieu_Dat)

        var Dieu_kien = { "Ma_so": Dien_thoai.Ma_so }
        var Gia_tri_Cap_nhat = {
            $set: { Danh_sach_Phieu_Dat: Dien_thoai.Danh_sach_Phieu_Dat }
        }
        var Kq = xl_mongo.cap_nhat_doi_tuong("Dien_thoai", Dieu_kien, Gia_tri_Cap_nhat)
    })

    // xóa session
    req.gio_hang.reset()
    res.send(JSON.stringify({ "Thong_bao": "OK" }))
})


module.exports = router;