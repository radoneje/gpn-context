var express = require('express');
var moment= require('moment');
var fs= require('fs');
var path= require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(true);
});
function adminLogin(req, res, next) {
  if(req.session.admin)
    return next();
  res.sendStatus(401);
}
function userLogin(req, res, next) {
  if(req.session.user && req.session.user.id)
    return next();
  res.sendStatus(401);
}
router.post('/adminContent' ,adminLogin ,async(req, res, next)=> {
  var row=await req.knex.select("*").from("t_cbrf_settings").orderBy("id", 'desc');
  var id=row[0].id;
  row=await req.knex("t_cbrf_settings").insert({site:JSON.stringify(row[0].site), content:JSON.stringify(row[0].content), speakers:JSON.stringify(row[0].speakers)},"*").where({id:id});
  var ret=await req.knex("t_cbrf_settings").update({content:req.body.data},"*").where({id:row[0].id})
  res.json(ret[0]);

});


router.post('/adminSpeakers' ,adminLogin ,async(req, res, next)=> {
  var row=await req.knex.select("*").from("t_cbrf_settings").orderBy("id", 'desc');
  var id=row[0].id;
  row=await req.knex("t_cbrf_settings").insert({site:JSON.stringify(row[0].site), content:JSON.stringify(row[0].content), speakers:JSON.stringify(row[0].speakers)},"*").where({id:id});
  var ret=await req.knex("t_cbrf_settings").update({speakers:req.body.data},"*").where({id:row[0].id})
  res.json(ret[0]);

});
router.post('/adminSite' ,adminLogin ,async(req, res, next)=> {

  var row=await req.knex.select("*").from("t_cbrf_settings").orderBy("id", 'desc');
  var id=row[0].id;
  row=await req.knex("t_cbrf_settings").insert({site:JSON.stringify(row[0].site), content:JSON.stringify(row[0].content), speakers:JSON.stringify(row[0].speakers)},"*").where({id:id});
  var ret=await req.knex("t_cbrf_settings").update({site:req.body.data},"*").where({id:row[0].id});
  res.json(ret[0]);

});

router.get('/content' , adminLogin,async(req, res, next)=> {

  var ret=await req.knex.select("*").from("t_cbrf_settings").orderBy("id", 'desc')
  if(ret.length==0)
    ret=await req.knex("t_cbrf_settings").insert({},"*")
  res.json(ret[0]);
});

router.get('/regUser', adminLogin ,async(req, res, next)=> {
  var ret=await req.knex.select("*").from("t_cbrf_users").orderBy("id", 'desc')
  ret.forEach(u=>{
    u.online=(req.counter.filter(user=>{return user.id==u.id}).length>0);
  })
  res.json(ret);
});


router.post("/q",userLogin, async(req, res, next)=> {
  if(!req.body.text)
    return res.sendStatus(405)
  if(!req.body.text.length>1200)
    return res.sendStatus(405)


  var ret=await req.knex("t_cbrf_q").insert({text:req.body.text, userid:req.session.user.id, date:new Date()}, "*")
  ret=await req.knex.select("*").from("v_cbrf_q").where({id:ret[0].id})

  res.json(ret[0]);
});
router.post("/chat",userLogin, async(req, res, next)=> {
  if(!req.body.text)
    return res.sendStatus(405)
  if(!req.body.text.length>1200)
    return res.sendStatus(405)


  var ret=await req.knex("t_cbrf_chat").insert({text:req.body.text, userid:req.session.user.id, date:new Date()}, "*")
  ret=await req.knex.select("*").from("v_cbrf_chat").where({id:ret[0].id})

  res.json(ret[0]);
});


router.post("/approveQ",adminLogin, async(req, res, next)=> {

  var ret=await req.knex("t_cbrf_q").update({isReady:req.body.isReady}, "*").where({id:req.body.id})
  ret=await req.knex.select("*").from("v_cbrf_q").where({id:ret[0].id})
  res.json(ret[0]);
});

router.post("/spkQ",adminLogin, async(req, res, next)=> {

  var ret=await req.knex("t_cbrf_q").update({isSpk:req.body.isSpk}, "*").where({id:req.body.id})
  ret=await req.knex.select("*").from("v_cbrf_q").where({id:ret[0].id})
  res.json(ret[0]);
});
router.post("/addChatAnswer",adminLogin, async(req, res, next)=> {

  var ret=await req.knex("t_cbrf_chat").update({answer:req.body.answer}, "*").where({id:req.body.id})
  ret=await req.knex.select("*").from("v_cbrf_chat").where({id:ret[0].id})
  res.json(ret[0]);
});
router.delete("/deleteAllQ",adminLogin, async(req, res, next)=> {
  var ret=await req.knex("t_cbrf_q").update({isDeleted:true}, "*")
  res.json(1);
});
router.delete("/deleteAllChat",adminLogin, async(req, res, next)=> {
  var ret=await req.knex("t_cbrf_chat").update({isDeleted:true}, "*")
  res.json(1);
});


router.get("/chat", adminLogin, async(req, res, next)=> {
  var ret={};
  ret.q=await req.knex.select("*").from("v_cbrf_q").orderBy("id");;
  ret.chat=await req.knex.select("*").from("v_cbrf_chat").orderBy("id");
  ret.state=(await req.knex.select("*").from("t_cbrf_state"))[0].val;
  return res.json(ret);
});

router.get("/q", async(req, res, next)=> {
  var ret={};
  ret.q=await req.knex.select("*").from("v_cbrf_q").where({isReady:true}).orderBy("id");;
  return res.json(ret);
});


router.delete("/chat/:id",async(req, res, next)=> {
  var ret =await req.knex("t_cbrf_chat").update({isDeleted:true}, "*").where({id:req.params.id})
  return res.json({id:req.params.id});
});
router.delete("/q/:id",async(req, res, next)=> {
  var ret =await req.knex("t_cbrf_q").update({isDeleted:true}, "*").where({id:req.params.id})
  return res.json({id:req.params.id});
});

router.post("/chatToQ",async(req, res, next)=> {

  console.log("chatToQ", req.body)
  var ret =await req.knex("t_cbrf_q").insert({text:req.body.text, userid:req.body.userid, date:req.body.date, isDeleted:false}, "*");

  return res.json(ret[0]);
});



router.get('/stat', adminLogin ,async(req, res, next)=> {

  var ret={};
  ret.now=req.counter.length;
  ret.loginsCount=(await req.knex.select("*").from("t_cbrf_logins")).length;
  ret.counts=[];// await req.knex.select("*").from("t_cbrf_count").where('date','>=', moment().add(-1, 'hours').toISOString())
  res.json(ret);
});
router.get('/spk', adminLogin ,async(req, res, next)=> {
  var ret= await req.knex.select("*").from("t_cbrf_spk").where({isDeleted:false}).orderBy("sortOrder")
  res.json(ret);
});
router.delete('/spk/:id', adminLogin ,async(req, res, next)=> {
  await req.knex("t_cbrf_spk").where({id:req.params.id}).delete();
  res.json(req.params.id);
});
router.post('/spk/', adminLogin ,async(req, res, next)=> {

  var id=req.body.id;
  delete req.body.id;
  var ret=await req.knex("t_cbrf_spk").update(req.body, "*").where({id:id})
  res.json(ret[0]);
});
router.get('/redirect', adminLogin ,async(req, res, next)=> {
  var ret=await req.knex.select("*").from("t_cbrf_redirect").orderBy("id")
  res.json(ret);
});

router.get('/codes', adminLogin ,async(req, res, next)=> {
  var ret=await req.knex.select("*").from("t_cbrf_codes").orderBy("f").orderBy("i").orderBy("o")
  res.json(ret);
});
router.post('/codes', adminLogin ,async(req, res, next)=> {

   let ret=await req.knex("t_cbrf_codes").insert(req.body.users,"*");
  res.json(ret);
});

router.post('/redirect', adminLogin ,async(req, res, next)=> {
 var id=req.body.id;
 console.log("dd", req.body)
 delete req.body.id;
  var ret=await req.knex("t_cbrf_redirect").update({value:req.body.value}, "*").where({id:id});
  res.json(ret[0]);
});
router.post('/redirectAdd', adminLogin ,async(req, res, next)=> {
  var ret=await req.knex("t_cbrf_redirect").insert({value:req.body.value}, "*");
  res.json(ret[0]);
});

router.post('/repositionSpk/', adminLogin ,async(req, res, next)=> {

  var id=req.body.id;
  delete req.body.id;
  await req.knex("t_cbrf_spk").update({sortOrder:req.body.sortOrder}, "*").where({id:id});
  var ret=await req.knex.select("*").from("t_cbrf_spk").orderBy("sortOrder");
  var i=0;
  for(var item  of ret){
    i=i+10;
    await req.knex("t_cbrf_spk").update({sortOrder:i}).where({id:item.id});
  }

  res.json(ret);
});



router.post('/spkImage', adminLogin ,async(req, res, next)=> {
  if(!req.files["image"])
    return res.sendStatus(404)
  //var ret= await req.knex.select("*").from("t_cbrf_spk").where({isDeleted:false}).orderBy("sortOrder")

  var filename=path.basename(req.files.image.path)
  var pathname=path.join(__dirname, '../public/images/spk/'+filename)
  fs.renameSync( req.files.image.path, pathname )
  res.json("/images/spk/"+filename);
});
router.post('/addSpk', adminLogin ,async(req, res, next)=> {

  delete req.body.id;
  req.body.sortOrder=(await req.knex("t_cbrf_spk").max("sortOrder"));
  req.body.sortOrder=req.body.sortOrder?req.body.sortOrder[0].max:0;
  req.body.sortOrder=req.body.sortOrder+10;

  var ret=await req.knex("t_cbrf_spk").insert(req.body, "*");
  res.json(ret[0]);

})




router.post('/regUser', async(req, res, next)=> {

  var usr = await req.knex("t_cbrf_users").insert({
    f: req.body.user.f,
    i: req.body.user.i,
    o: req.body.user.o,
    email: req.body.user.email.toLowerCase(),
    date: new Date(),
  }, "*")
  res.json(usr[0]);
});
router.post('/messageToUser', async(req, res, next)=> {
  var usr = await req.knex("t_cbrf_users").update({message:req.body.user.message, messageIsActive:req.body.user.messageIsActive}, "*").where({id:req.body.user.id})

  res.json(usr[0]);
});

router.post('/loginUser', async(req, res, next)=> {
  console.log("loginUser");
  var usrs = await req.knex.select("*").from("t_cbrf_users").where({email:req.body.user.email.toLowerCase()});
  if(usrs.length==0)
    return res.json(false);
  return res.json(usrs[0]);
})
router.post('/aliveUser', userLogin, async(req, res, next)=> {

  if(req.counter.filter(c=>{return c.id==req.session.user.id}).length==0)
  {
    req.counter.push({id:req.session.user.id, date:moment().unix()});
    await req.knex("t_cbrf_count").insert({count:req.counter.length, date:new Date()})
    await req.knex("t_cbrf_logins").insert({
      userid:req.session.user.id,
      date: new Date(),
    })
  }
  else{
    req.counter.forEach(c=>{
      if(c.id==req.session.user.id)
        c.date=moment().unix()
    })
  }
  let messages=await req.knex.select("message").from("t_cbrf_users").where({id:req.session.user.id, messageIsActive:true})
  if(!messages)
    messages=[];
    messages=messages.filter(m=>{return m.message.length>0});
  res.json({
    userid:req.session.user.id,
    date: new Date(),
    messages:messages
  })
});



router.get('/count', function(req, res, next) {
  res.json(req.counter.length);
});
router.get('/videoUsers', async function(req, res, next) {
  let  ret = await req.knex.select("*").from("t_cbrf_users").where({code:"34705428"}).orderBy("id")
  res.json(ret);
});

router.post('/registerUser', async(req, res, next) =>{

  try {

    let ret = await req.knex.select("*").from("t_cbrf_codes").where({
      code: req.body.code,
      //f: req.body.f,
     // i: req.body.i
    });
    if (ret.length == 0)
      return res.json({status: -1});
    req.body.deptId = req.body.dept.id;
    req.body.deptTitle = req.body.dept.title;
    delete req.body.dept;

    req.body.date = new Date();

    ret = await req.knex("t_cbrf_users").insert(req.body, "*");
    req.session["user"] = ret[0];
    req.session["user"].code=req.body.code;
    res.json({status: 1});
  }
  catch (e) {
    res.status(500).json(e);
  }
});
router.get('/votes', async(req, res, next) =>{

//  req.knex.select("*").from("t_cbrf_codes")
  var ret=await req.knex.select("*").from("t_cbrf_vote").where({isDeleted:false}).orderBy("id");;

  for(var item of ret){
    var total=0;
    var a=await req.knex.select("*").from("t_cbrf_voteanswers").where({isDeleted:false, voteid:item.id}).orderBy("id");
    a.forEach(b=>{total+=b.count});

    a.forEach(b=>{b.perc=parseFloat(parseFloat(b.count)/parseFloat(total==0?1:total))});
    item.total=total;
    item.answers=a

  }
  var tags=await req.knex.select("*").from("t_cbrf_tags").where({isDeleted:false}).orderBy("id");
  tags.answers;
  for(var tag of tags){
    tags.answers=await req.knex.select("*").from("t_cbrf_tagsanswers").where({isDeleted:false}).orderBy("id");
  }

  let q=await req.knex.select("*").from("v_cbrf_q").orderBy("id");
  q=q.filter(q=>!q.isDeleted);
  let chat =await req.knex.select("*").from("v_cbrf_chat").orderBy("id");
  chat=chat.filter(q=>!q.isDeleted);
  res.json({
    votes:ret,
    tags:tags,
    q,
    chat,
    state:(await req.knex.select("*").from("t_cbrf_state"))[0].val
  });

})
router.get('/tags', async(req, res, next) =>{

//  req.knex.select("*").from("t_cbrf_codes")
  var ret=await req.knex.select("*").from("t_cbrf_tags").where({isDeleted:false}).orderBy("id");;

  /*for(var item of ret){
    var total=0;
    var a=await req.knex.select("*").from("t_cbrf_tagsanswers").where({isDeleted:false, voteid:item.id}).orderBy("id");
    a.forEach(b=>{total+=b.count});

    a.forEach(b=>{b.perc=parseFloat(parseFloat(b.count)/parseFloat(total==0?1:total))});
    item.total=total;
    item.answers=a

  }*/
  res.json(ret);

})
router.post("/tagsDo/", userLogin, async (req, res, next) => {

  var tagsid=req.body.id;
  console.log("tagsDo",req.body)
  var words=req.body.text.split(',');

  var ret=[]
  words.forEach(w=>{
    ret.push( w.replace(/^\s+|\s+$/g, "").toUpperCase());
  })
  words=ret.filter(w=>{
    return w.length>0
  })
  console.log("tagsDo",req.body,words)
  for(var w of words){
    var v = await req.knex("t_cbrf_tagsanswers")
        .insert({val:w, tagsid:tagsid}, "*")
  }
  res.json(words.length);
})


router.post('/voting', userLogin, async(req, res, next) =>{
  var a=await req.knex.select("*").from("t_cbrf_voteanswers").where({id:req.body.id})
  await req.knex("t_cbrf_voteanswers").update({count:(a[0].count+1)}).where({id:req.body.id})
  res.json(req.body.id)
});

router.post('/unvote', userLogin, async(req, res, next) =>{
  for(var item of req.body) {

    var a = await req.knex.select("*").from("t_cbrf_voteanswers").where({id: item.id})
    if(a[0].count>0) {
      console.log("unvote", {count: (a[0].count - 1), id:req.body.id})
      await req.knex("t_cbrf_voteanswers").update({count: (a[0].count - 1)}).where({id: item.id})
    }
  }
  res.json(req.body.id)
});



router.post("/qLike",userLogin, async (req, res, next) => {
  var r = await req.knex.select("*").from("t_cbrf_q").where({id:req.body.id});
  if(r.length<1)
    res.sendStatus(404)
  var rr=await req.knex("t_cbrf_q").update({likes:r[0].likes+1},"*").where({id:req.body.id});
  res.json({likes:rr[0].likes});
})
router.post("/qUnLike",userLogin, async (req, res, next) => {
  var r = await req.knex.select("*").from("t_cbrf_q").where({id:req.body.id});
  if(r.length<1)
    res.sendStatus(404)
  var rr=await req.knex("t_cbrf_q").update({likes:r[0].likes-1},"*").where({id:req.body.id});
  res.json({likes:rr[0].likes});
})

router.post('/voteAdd', adminLogin,async(req, res, next) =>{
  var ret=await req.knex("t_cbrf_vote").insert({},"*");
  ret[0].answers=await req.knex("t_cbrf_voteanswers").insert([{voteid:ret[0].id},{voteid:ret[0].id}],"*");
  res.json(ret[0]);

})

router.post('/tagsAdd', adminLogin,async(req, res, next) =>{
  var ret=await req.knex("t_cbrf_tags").insert({ date:new Date()},"*");
  res.json(ret[0]);

})
router.post('/addVoteAnswer', adminLogin,async(req, res, next) =>{
  var ret=await req.knex("t_cbrf_voteanswers").insert({voteid:req.body.id},"*");
  res.json(ret[0]);

})

router.post('/voteChange', adminLogin,async(req, res, next) =>{
  var id=req.body.id;
  delete req.body.id;
  delete req.body.answers;
  delete req.body.total;
  var ret=await req.knex("t_cbrf_vote").update(req.body,"*").where({id:id});
  res.json(ret[0]);

})
router.post('/tagsChange', adminLogin,async(req, res, next) =>{
  var id=req.body.id;
  delete req.body.id;
  delete req.body.answers;
  var ret=await req.knex("t_cbrf_tags").update(req.body,"*").where({id:id});
  res.json(ret[0]);

})
router.post('/answerChange', adminLogin,async(req, res, next) =>{
  var id=req.body.id;
  delete req.body.id;
  var ret=await req.knex("t_cbrf_voteanswers").update({title:req.body.title},"*").where({id:id});
  res.json(ret[0]);

})

router.post('/state', adminLogin,async(req, res, next) =>{
  req.state=req.body;
  console.log("req.state", req.state)
  await req.knex("t_cbrf_state").update({val:JSON.stringify(req.state)});
  res.json(req.state);
})









module.exports = router;
