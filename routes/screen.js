var express = require('express');
var router = express.Router();
var content=require('./../content')



router.get('/vote', async (req, res, next) =>{
res.render("screenVote")
})
router.get('/q', async (req, res, next) =>{
  res.render("screenQ")
})
router.get('/spk', async (req, res, next) =>{
  res.render("screenSpk")
})

router.get('/zoom/:id', async (req, res, next) =>{
  //res.render('work', { title: 'under constaction' });
  var ret=await req.knex.select("*").from("t_cbrf_redirect").where({id:req.params.id});
  if(ret.length<1)
    return res.sendStatus(404);

  res.redirect(ret[0].value)

});


module.exports = router;
