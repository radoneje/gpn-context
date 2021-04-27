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
    res.render('adminLogin', { title: 'admin' });
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
    res.render('adminLogin', { title: 'admin' });
  else
  {
    req.session.admin=true;
    res.render('admin', { title: 'admin' ,disable:[1,0,3,5,6,7,10] });
  }
});
router.get('/camera', async (req, res, next) =>{
    res.render('camera', { title: 'admin' })
});
router.get('/phoner', async (req, res, next) =>{
  if(req.session.admin)
    res.render('phoner', { title: 'admin' })
  else
    res.render('adminLogin', { title: 'admin' });


});
router.get('/', async (req, res, next) =>{
  return res.render('start');
  //res.render('work', { title: 'under constaction' });
  res.redirect("/index/ru")

});
router.get('/index/:lang?', async (req, res, next) =>{
  if(!req.session["user"])
    res.redirect("/login")
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
      // res.render('start')
 res.render('index', {  lang:req.params.lang, speakers:speakers, site:content[0].site, content:content[0].content, isCamera:req.session["user"].code=="34705428" , user:req.session["user"]});
});

router.get('/login/:lang?', async (req, res, next) =>{
  //return res.render('start');
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
router.get('/screen', async (req, res, next) =>{
  res.render("screen")
})


router.get('/badbrowser', async (req, res, next) =>{
  res.render("badbrowser")
})
router.get('/test/:lang?', async (req, res, next) =>{
  //return res.render('start');
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
  return  res.redirect("/index/"+req.params.lang)
   //res.render('index', {  lang:req.params.lang, speakers:speakers, site:content[0].site, content:content[0].content, user: });

});

router.get('/zoom/:id', async (req, res, next) =>{
  //res.render('work', { title: 'under constaction' });
  var ret=await req.knex.select("*").from("t_cbrf_redirect").where({id:req.params.id});
  if(ret.length<1)
    return res.sendStatus(404);

  res.redirect(ret[0].value)

});
router.get('/tagsres/:id',  async (req, res, next) =>{
  var vv=await req.knex.select('val', req.knex.raw('count(*)')).from('t_cbrf_tagsanswers').where({tagsid:req.params.id}).groupBy('val').havingRaw("val IS NOT null");
  var tag=await req.knex.select('id','title').from('t_cbrf_tags').where({id:req.params.id})
  if(tag.length==0)
    return res.sendStatus(404);
  console.log("tags", tag)

  res.render("tagsres",{title:"results", arr:JSON.stringify(vv),tag:tag[0]})
})


module.exports = router;
