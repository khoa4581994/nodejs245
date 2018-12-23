var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('client-sessions')
fileUpload = require('express-fileupload'); // Upload file


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// default options
app.use(fileUpload());

var xl_mongo = require('./public/xu_ly/XL_LUU_TRU_MONGO.js');
Du_lieu = {}
var proCuahang = xl_mongo.ds_doi_tuong("Cua_hang")
var proDienthoai = xl_mongo.ds_doi_tuong("Dien_thoai")
var proNguoidung = xl_mongo.ds_doi_tuong("Nguoi_dung")
proCuahang.then(result => {
    Du_lieu.Cua_hang = Du_lieu.Cua_hang = result[0]
})
proDienthoai.then(result => {
    Du_lieu.Danh_sach_Dien_thoai = result

})
proNguoidung.then(result => {
    Du_lieu.Danh_sach_Nguoi_dung = result

})







//khởi tạo thư viện session-client: đăng nhập quản trị
app.use(session({
    cookieName: 'session',
    secret: '2eca38b4-28d1-11e7-93ae-92361f002671',
    duration: 60 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

//khởi tạo thư viện session-client: Giỏ hàng
app.use(session({
    cookieName: 'gio_hang',
    secret: '2bca65b4-28b1-12e7-93ae-92361f002739',
    duration: 60 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

//gửi session sang template để sử dụng
app.use(function(req, res, next) {
    res.locals.Nguoi_dung = req.session.Nguoi_dung;
    res.locals.Gio_hang = req.gio_hang.Gio_hang;
    next();
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use('/admin', adminRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;