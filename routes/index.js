var express = require('express');
var router = express.Router();
var content=require('./../content')


router.get('/admin', async (req, res, next) =>{
  if(req.session.admin)
    res.render('admin', { title: 'admin' ,disable:[] });
  else
    res.render('adminLogin', { title: 'admin' });
});

router.post('/admin', async (req, res, next) =>{
  if(req.body.l!="editor" || req.body.p!="dfczgegrby" )
    res.render('adminlogin', { title: 'admin' });
  else
  {
    req.session.admin=true;
    res.render('admin', { title: 'admin' ,disable:[] });
  }
});

router.get('/moderator', async (req, res, next) =>{
  if(req.session.admin)
    res.render('admin', { title: 'admin' ,disable:[1,0,3,5,6,7] });
  else
    res.render('adminLogin', { title: 'admin' });
});

router.post('/moderator', async (req, res, next) =>{
  if(req.body.l!="editor" || req.body.p!="dfczgegrby" )
    res.render('adminlogin', { title: 'admin' });
  else
  {
    req.session.admin=true;
    res.render('admin', { title: 'admin' ,disable:[1,0,3,5,6,7] });
  }
});

router.get('/', async (req, res, next) =>{
  return res.render('start');
  //res.render('work', { title: 'under constaction' });
  res.redirect("/index/ru")

});
/*router.get('/index/:lang?', async (req, res, next) =>{
  if(!req.params.lang)
    req.params.lang="ru"
  req.params.lang=req.params.lang.toLowerCase();
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    res.redirect("/index/ru")
  //res.render('work', { title: 'under constaction' });
  var content=await req.knex.select("*").from("t_cbrf_settings").orderBy("id", 'desc')
  var speakers=await req.knex.select("*").from("t_cbrf_spk").orderBy("sortOrder")
  //res.redirect("/login/ru")
      // res.sendStatus(404)
  res.render('start')
 // res.render('index', {  lang:req.params.lang, speakers:speakers, site:content[0].site, content:content[0].content });

});*/

router.get('/login/:lang?', async (req, res, next) =>{
  return res.render('start');
  req.session["user"]=null;
  if(!req.params.lang)
    req.params.lang="ru"
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    req.params.lang="ru"
  var dept=await req.knex.select("*").from("t_cbrf_dept").orderBy("order")
  dept.forEach(d=>{
    delete d.code;
  })
  res.render('login', {  lang:req.params.lang, dept:dept });

})
router.get('/player', async (req, res, next) =>{
  if(!req.session.user)
    return next();
  res.render("player")
})

router.get('/badbrowser', async (req, res, next) =>{
  res.render("badbrowser")
})
router.get('/index/:lang?', async (req, res, next) =>{
  return res.render('start');
  if(!req.params.lang)
    req.params.lang="ru"
  req.params.lang=req.params.lang.toLowerCase();
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    res.redirect("/index/ru")
  if(!req.session["user"])
    return  res.redirect("/login/"+req.params.lang)
  //res.render('work', { title: 'under constaction' });
  var content=await req.knex.select("*").from("t_cbrf_settings").orderBy("id", 'desc')
  var speakers=await req.knex.select("*").from("t_cbrf_spk").orderBy("sortOrder")
  //res.redirect("/login/ru")
 // res.sendStatus(404)
   res.render('index', {  lang:req.params.lang, speakers:speakers, site:content[0].site, content:content[0].content });

});

router.get('/zoom/:id', async (req, res, next) =>{
  //res.render('work', { title: 'under constaction' });
  var ret=await req.knex.select("*").from("t_cbrf_redirect").where({id:req.params.id});
  if(ret.length<1)
    return res.sendStatus(404);

  res.redirect(ret[0].value)

});


module.exports = router;
