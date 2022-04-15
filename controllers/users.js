const User = require('../models/user');

module.exports.getRegister = (req, res) => {
    res.render('../users/register');
};

module.exports.postRegister = async (req, res) => {
    try {
        // tách email,username và password từ req.body
        const { email, username, password } = req.body;
        // tạo 1 User mới trong data base lấy email username vừa tách
        const user = new User({ email, username })
        // trigger hàm register để harsh user and password
        const registeredUser = await User.register(user, password);
        req.login (registeredUser ,err =>{
            if(err) return next(err)
            console.log(registeredUser);
            req.flash('success', 'Welcome to YelpCamp')
            res.redirect('/campgrounds')
        })
        
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }

};

module.exports.getLogin = (req, res) => {
    res.render('../users/login');
};

module.exports.postLogin =  (req, res) => { // use local strategy nếu fail thì ....
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo
    res.redirect(redirectUrl)
};


module.exports.getLogout = (req, res)=>{
    req.logout();
    req.flash('success', 'GoodBye');
    res.redirect('/campgrounds')
};