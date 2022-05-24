var express = require('express');
var moment= require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(true);
});
function adminLogin(req, res, next) {
  console.log("al", req.session)
  if(req.session.admin)
    return next();
  res.sendStatus(401);
}
router.post('/adminContent' ,adminLogin ,async(req, res, next)=> {
  var row=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc');
  var id=row[0].id;
  row=await req.knex("t_sbpb_settings").insert({site:JSON.stringify(row[0].site), content:JSON.stringify(row[0].content), speakers:JSON.stringify(row[0].speakers)},"*").where({id:id});
  var ret=await req.knex("t_sbpb_settings").update({content:req.body.data},"*").where({id:row[0].id})
  res.json(ret[0]);

});


router.post('/adminSpeakers' ,adminLogin ,async(req, res, next)=> {
  var row=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc');
  var id=row[0].id;
  row=await req.knex("t_sbpb_settings").insert({site:JSON.stringify(row[0].site), content:JSON.stringify(row[0].content), speakers:JSON.stringify(row[0].speakers)},"*").where({id:id});
  var ret=await req.knex("t_sbpb_settings").update({speakers:req.body.data},"*").where({id:row[0].id})
  res.json(ret[0]);

});
router.post('/adminSite' ,adminLogin ,async(req, res, next)=> {

  var row=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc');
  var id=row[0].id;
  row=await req.knex("t_sbpb_settings").insert({site:JSON.stringify(row[0].site), content:JSON.stringify(row[0].content), speakers:JSON.stringify(row[0].speakers)},"*").where({id:id});
  var ret=await req.knex("t_sbpb_settings").update({site:req.body.data},"*").where({id:row[0].id});
  res.json(ret[0]);

});

router.get('/content' , adminLogin,async(req, res, next)=> {

  var ret=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc')
  if(ret.length==0)
    ret=await req.knex("t_sbpb_settings").insert({},"*")
  res.json(ret[0]);
});

router.get('/regUser', adminLogin ,async(req, res, next)=> {
  var ret=await req.knex.select("*").from("t_sbpb_users").orderBy("id", 'desc')
  ret.forEach(u=>{
    u.online=(req.counter.filter(user=>{return user.id==u.id}).length>0);
  })
  res.json(ret);
});

router.post("/chat",async(req, res, next)=> {
  if(!req.body.text)
    return res.sendStatus(404)
  if(!req.body.text.length>1200)
    return res.sendStatus(404)
  if(!req.body.userid)
    return res.sendStatus(404)

  var ret=await req.knex("t_sbpb_chat").insert({text:req.body.text, userid:req.body.userid, date:new Date()}, "*")
  ret=await req.knex.select("*").from("v_sbpb_chat").where({id:ret[0].id})

  res.json(ret[0]);
});
router.post("/q",async(req, res, next)=> {
  if(!req.body.text)
    return res.sendStatus(404)
  if(!req.body.text.length>1200)
    return res.sendStatus(404)
  if(!req.body.userid)
    return res.sendStatus(404)
var usr=await  req.knex.select("*").from("t_sbpb_users");
  var ret=await req.knex("t_sbpb_q").insert({text:req.body.text, userid:usr[0].id/*req.body.userid*/, date:new Date()}, "*")
  ret=await req.knex.select("*").from("v_sbpb_q").where({id:ret[0].id})

  res.json(ret[0]);
});
router.get("/chat",async(req, res, next)=> {
  var ret={};
  ret.q=await req.knex.select("*").from("v_sbpb_q").orderBy("id");;
  ret.chat=await req.knex.select("*").from("v_sbpb_chat").orderBy("id");
  return res.json(ret);
});
router.delete("/chat/:id",async(req, res, next)=> {
  var ret =await req.knex("t_sbpb_chat").update({isDeleted:true}, "*").where({id:req.params.id})
  return res.json({id:req.params.id});
});
router.delete("/q/:id",async(req, res, next)=> {
  var ret =await req.knex("t_sbpb_q").update({isDeleted:true}, "*").where({id:req.params.id})
  return res.json({id:req.params.id});
});

router.post("/chatToQ",async(req, res, next)=> {

  console.log("chatToQ", req.body)
  var ret =await req.knex("t_sbpb_q").insert({text:req.body.text, userid:req.body.userid, date:req.body.date, isDeleted:false}, "*");

  return res.json(ret[0]);
});



router.get('/stat', adminLogin ,async(req, res, next)=> {

  var ret={};
  ret.now=req.counter.length;
  ret.loginsCount=(await req.knex.select("*").from("t_sbpb_logins")).length;
  ret.counts= await req.knex.select("*").from("t_sbpb_count").where('date','>=', moment().add(-4, 'hours').toISOString())
  res.json(ret);
});

router.post('/regUser', async(req, res, next)=> {

  var usr = await req.knex("t_sbpb_users").insert({
    f: req.body.user.f,
    i: req.body.user.i,
    o: req.body.user.o,
    email: req.body.user.email.toLowerCase(),
    date: new Date(),
  }, "*")
  res.json(usr[0]);
});
router.post('/loginUser', async(req, res, next)=> {
  console.log("loginUser");
  var usrs = await req.knex.select("*").from("t_sbpb_users").where({email:req.body.user.email.toLowerCase()});
  if(usrs.length==0)
    return res.json(false);
  req.session["user"]=usrs[0];
  return res.json(usrs[0]);
})
router.post('/aliveUser', async(req, res, next)=> {
  console.log("aliveUser", req.body)
  if(req.counter.filter(c=>{return c.id==req.body.id}).length==0)
  {
    req.counter.push({id:req.body.id, date:moment().unix()});
    await req.knex("t_sbpb_count").insert({count:req.counter.length, date:new Date()})
    await req.knex("t_sbpb_logins").insert({
      userid:req.body.id,
      date: new Date(),
    })

  }
  else{
    req.counter.forEach(c=>{
      if(c.id==req.body.id)
        c.date=moment().unix()
    })
  }
  res.json({
    userid:req.body.id,
    date: new Date(),
  })
})
router.get('/count', function(req, res, next) {
  res.json(req.counter.length);
});



module.exports = router;
