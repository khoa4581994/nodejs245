var express = require('express');
var router = express.Router();

var xl_mongo = require('../public/xu_ly/XL_LUU_TRU_MONGO.js');



router.get('/', function(req, res, next) {
    res.render('dang_nhap', {
        Cua_hang: Du_lieu.Cua_hang,
        Thong_bao: ""
    });
});

// Xử lý đăng nhập
router.post("/dang-nhap", function(req, res, next) {
    var Ten = req.body.Ten_Dang_nhap
    var Mat_khau = req.body.Mat_khau
    var Nguoi_dung = Du_lieu.Danh_sach_Nguoi_dung.find(x => x.Ten_Dang_nhap.toLowerCase() == Ten.toLowerCase())
    if (!Nguoi_dung) {
        res.render('dang_nhap', {
            Cua_hang: Du_lieu.Cua_hang,
            Thong_bao: "Người dùng không tồn tại"
        });
    } else {
        if (Mat_khau.toLowerCase() === Nguoi_dung.Mat_khau.toLowerCase()) {
            // sets a cookie with the user's info
            req.session.Nguoi_dung = Nguoi_dung;
            res.redirect('/admin/quan-tri'); // Đăng nhập thành công chuyển trang

        } else {
            res.render('dang_nhap', {
                Cua_hang: Du_lieu.Cua_hang,
                Thong_bao: "Mật khẩu không đúng"
            });
        }
    }
});

// Thoát đăng nhập
router.get('/thoat-dang-nhap', function(req, res) {
        req.session.reset();
        //req.session.Nguoi_dung = null;
        //res.locals.Nguoi_dung = req.session.Nguoi_dung
        res.redirect('/admin');
    })
    //Goi trang quan tri
router.get('/quan-tri', requireLogin, function(req, res) {
    res.render('quan_tri', {
        Cua_hang: Du_lieu.Cua_hang,
        ds_Dien_thoai: Du_lieu.Danh_sach_Dien_thoai,
        Thong_bao: ""
    });
});

router.get('/them-dien-thoai', requireLogin, function(req, res) {

    res.render('themdienthoai', {
        Cua_hang: Du_lieu.Cua_hang,
    })
})

router.post('/ghi-dien-thoai-moi', function(req, res) {
    var Ma_so = Lay_Ma_so_cuoi(req.body.Nhom_Dien_thoai)
    var Ten = req.body.Ten
    var Don_gia_Nhap = Number(req.body.Don_gia_Nhap)
    var Don_gia_Ban = Number(req.body.Don_gia_Ban)
    var Nhom_Dien_thoai_Ten = req.body.Nhom_Dien_thoai
    var Nhom_Dien_thoai_Ma_so = req.body.Nhom_Dien_thoai
    var Dien_thoai = {
        "Ten": Ten,
        "Ma_so": Ma_so,
        "Don_gia_Ban": Don_gia_Ban,
        "Don_gia_Nhap": Don_gia_Nhap,
        "Nhom_Dien_thoai": {
            "Ten": Nhom_Dien_thoai_Ten,
            "Ma_so": Nhom_Dien_thoai_Ma_so
        },
        "Danh_sach_Phieu_Dat": [],
        "Danh_sach_Phieu_Ban": [],
        "Danh_sach_Phieu_Nhap": []
    }

    // Thêm vào CSDL
    var kq = xl_mongo.them_doi_tuong("Dien_thoai", Dien_thoai)
        // Upload hình
    var hinh = req.files.hinh;
    var ten_hinh = `${Ma_so}.png`
    hinh.mv(`./public/images/images/${ten_hinh}`, function(err) {
        if (err)
            return res.status(500).send(err);

        //res.send('File uploaded!');
    });
    Du_lieu.Danh_sach_Dien_thoai.push(Dien_thoai)
        //console.log(Dien_thoai)
    res.redirect('/admin/quan-tri')

})


function Lay_Ma_so_cuoi(nhom) {
    Nhom_Dien_thoai = nhom;
    var Danh_sach_Ma_so = []
    Du_lieu.Danh_sach_Dien_thoai.forEach(Dien_thoai => {
        if (Dien_thoai.Nhom_Dien_thoai.Ma_so == Nhom_Dien_thoai) {
            var Thanh_phan_con = Dien_thoai.Ma_so.trim().split("_")
            Danh_sach_Ma_so.push(parseInt(Thanh_phan_con[1]))
        }

    })

    Danh_sach_Ma_so.sort(function(a, b) {
        return a - b
    })

    var Ma_so_Sau_cung = Danh_sach_Ma_so[Danh_sach_Ma_so.length - 1]
    Ma_so_Sau_cung += 1
    var Ma_so = Nhom_Dien_thoai + "_" + Ma_so_Sau_cung.toString()
    return Ma_so
}


router.put('/cap-nhat-dien-thoai', function(req, res) {
    var pMa_so = req.body.Ma_so
    var pTen = req.body.Ten
    var pDon_gia_Ban = req.body.Don_gia_Ban
    var pDon_gia_Nhap = req.body.Don_gia_Nhap

    var dieu_kien = { Ma_so: pMa_so }
    var cap_nhat = {
        $set: {
            Ten: pTen,
            Don_gia_Ban: pDon_gia_Ban,
            Don_gia_Nhap: pDon_gia_Nhap
        }
    }

    var kq = xl_mongo.cap_nhat_doi_tuong("Dien_thoai", dieu_kien, cap_nhat)

    var vt = Du_lieu.Danh_sach_Dien_thoai.findIndex(x => x.Ma_so == pMa_so)
    Du_lieu.Danh_sach_Dien_thoai[vt].Ten = pTen
    Du_lieu.Danh_sach_Dien_thoai[vt].Don_gia_Ban = pDon_gia_Ban
    Du_lieu.Danh_sach_Dien_thoai[vt].Don_gia_Nhap = pDon_gia_Nhap

    res.send(JSON.stringify(Du_lieu.Danh_sach_Dien_thoai[vt]))

})

router.delete('/xoa-dien-thoai', function(req, res) {
    var pMa_so = req.body.Ma_so
    var dieu_kien = { Ma_so: pMa_so }
    var kq = xl_mongo.xoa_doi_tuong("Dien_thoai", dieu_kien)
    var vt = Du_lieu.Danh_sach_Dien_thoai.findIndex(x => x.Ma_so == pMa_so)
    Du_lieu.Danh_sach_Dien_thoai.splice(vt, 1)
    res.send(JSON.stringify({ ok: "OK" }))
})

router.post('/tim_kiem_sp', function(req, res, next) {
    var gtTim = req.body.k.trim()
    var ds = Du_lieu.Danh_sach_Dien_thoai.filter(x => x.Ten.toLocaleLowerCase().includes(gtTim.toLocaleLowerCase()))
    res.render('quan_tri', {
        Cua_hang: Du_lieu.Cua_hang,
        ds_Dien_thoai: ds,
        Thong_bao: ""
    });
});

//Lap lai thao tac dat nhap
function requireLogin(req, res, next) {
    if (!req.session.Nguoi_dung) {
        res.redirect('/admin');
    } else {
        next();
    }
};
module.exports = router;