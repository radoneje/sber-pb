var express = require('express');
var router = express.Router();

router.get('/admin', async (req, res, next) =>{
  if(req.session.admin)
    res.render('admin', { title: 'admin' });
  else
    res.render('adminLogin', { title: 'admin' });
});

router.post('/admin', async (req, res, next) =>{
  if(req.body.l!="editor" || req.body.p!="dfczgegrby" )
    res.render('adminlogin', { title: 'admin' });
  else
  {
    req.session.admin=true;
    res.render('admin', { title: 'admin' });
  }
});

/* GET home page. */
router.get('/', async (req, res, next) =>{
  //res.render('work', { title: 'under constaction' });
 res.redirect("/index/ru")
  //res.redirect("/registration/ru")

});
router.get('/index/:lang?', async (req, res, next) =>{
  if(!req.params.lang)
    req.params.lang="ru"
  req.params.lang=req.params.lang.toLowerCase();
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    res.redirect("/index/ru")

  if(req.session["user"])
    return res.redirect("/player/"+req.params.lang)
  //res.render('work', { title: 'under constaction' });
  var content=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc')
  ///res.redirect("/login/ru")
  res.render('index', { title: 'sber-pb', stage:3/*3 6 1*/, lang:req.params.lang, speakers:content[0].speakers, site:content[0].site, content:content[0].content });

});

router.get('/deposit/', async (req, res, next) =>{

  res.redirect("/")
});
router.get('/pronalog/', async (req, res, next) =>{

  //res.render('work', { title: 'under constaction' });
  var content=await req.knex.select("*").from("t_sbpb_settings").where({id:234}).orderBy("id", 'desc')
  ///res.redirect("/login/ru")
  res.render('pronalog', { title: 'sber-pb', stage:6/*3 6 1*/, lang:"ru", speakers:content[0].speakers, site:content[0].site, content:content[0].content });

});

router.get('/registration/:lang?', async (req, res, next) =>{
  if(!req.params.lang)
    req.params.lang="ru"
  req.params.lang=req.params.lang.toLowerCase();
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    res.redirect("/index/ru")
  //res.render('work', { title: 'under constaction' });
  var content=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc')
  res.render('index', { title: 'sber-pb', stage:1, lang:req.params.lang, speakers:content[0].speakers, site:content[0].site, content:content[0].content });

});


router.get('/badbrowser',async  function(req, res, next) {
  var content=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc')
  res.render('badbrowser', { title: 'sber-pb', stage:1, site:content[0].site });
});

router.get('/login', async (req, res, next)=> {
  res.redirect("/login/ru")
})
router.get('/login/:lang?', async (req, res, next)=> {
  if(!req.params.lang)
    req.params.lang="ru"
  req.params.lang=req.params.lang.toLowerCase();
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    res.redirect("/login/ru")

  var content=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc')

  res.render('index', { title: 'sber-pb', stage:3, lang:req.params.lang, speakers:content[0].speakers, site:content[0].site, content:content[0].content });


});
router.get('/player', async (req, res, next)=> {
  res.redirect("/player/ru")
})
router.get('/player/:lang?', async (req, res, next)=> {
  if(!req.params.lang)
    req.params.lang="ru"
  req.params.lang=req.params.lang.toLowerCase();
  if(!(req.params.lang=="ru" || req.params.lang=="en"))
    res.redirect("/player/ru")
  if(!req.session["user"])
    return res.redirect("/index/"+req.params.lang)

  var content=await req.knex.select("*").from("t_sbpb_settings").orderBy("id", 'desc')

  res.render('index', { title: 'sber-pb',  stage:6/*stage:10*/, lang:req.params.lang, speakers:content[0].speakers, site:content[0].site, content:content[0].content });

});

router.get('/zoom/:id', async (req, res, next) =>{
  await redirect("a",req, res)
});



async function redirect(f,req,res){
  var key=f+req.params.id;
  console.log(key)
  var r= await req.knex.select("*").from("t_redirect").where({key})
  if(r.length==0)
    return res.sendStatus(404);
  if(!r[0].value)
    r[0].value="/"
  res.redirect(r[0].value);
}


module.exports = router;
