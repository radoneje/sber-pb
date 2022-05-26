var app=new Vue({
    el:"#app",
    data:{
        loaded:false,
        user:{f:"",i:"",o:"",email:"", id:null, promice:false},
        promice:false,
        err:{f:false, i:false, e:false,promice:false},
        showPromice:false,
        stage:1,
        isLogin:false,
        isPlayer:false,
        lang:lang,
        chatIsActive:false,
        activeSpk:null,
        chat:[],
        q:[],
        chatText:'',
        qText:'',
        chatTextSend:false,
    },
    methods:{
        newChat:async function(){
            this.chatTextSend=true
            try{

                if(this.chatText.length>0){
                    var ret=await axios.post("/api/chat",{userid:this.user.id, text:this.chatText});
                    this.chatText="";

                    this.chat.push(ret.data);
                    var objDiv = document.getElementById("chatBox");
                    if(objDiv)
                        setTimeout(function () {
                            objDiv.scrollTop = objDiv.scrollHeight;
                        }, 0)
                    setTimeout(()=>{this.chatTextSend=false},2000)
                }
                else
                    this.chatTextSend=false
            }
            catch (e) {
                console.warn(e);
                this.chatTextSend=false

            }
        },
        newQ:async function(){
            this.chatTextSend=true
            try{

                if(this.qText.length>0){
                    var ret=await axios.post("/api/q",{userid: 1 /*this.user.id*/, text:this.qText});
                    this.qText="";
                    this.q.push(ret.data);
                    console.log(ret.data)
                    var objDiv = document.getElementById("qBox");

                    if(objDiv)
                        setTimeout(function () {
                            objDiv.scrollTop = objDiv.scrollHeight;
                        }, 0)
                    setTimeout(()=>{this.chatTextSend=false},2000)
                }
                else
                    this.chatTextSend=false
            }
            catch (e) {
                console.warn(e);
                this.chatTextSend=false

            }
        },
        checkf:function(text){

            this.err.f=(text.length<2 || text.length>120)
        },
        checki:function(text){
            this.err.i=(text.length<2 || text.length>120)
        },
        checkEmail:function(text, err){
            if(text.length<2 || text.length>120) {
                this.err.e = true;
                return true;
            }
            if(!validateEmail(text)){
                this.err.e = true;
                return true;
            }
            this.err.e=false;
            return  false;

            function validateEmail(email) {
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            }

        },
        register: async function () {
            this.checkf(this.user.f);
            this.checki(this.user.i);
            this.checkEmail(this.user.email);

            if((this.err.f || this.err.i ||  this.err.e  ))
                return;
            if(!this.user.promice)
                return  this.err.promice=true;

            this.stage=0;

            EPPZScrollTo.scrollVerticalToElementById('regFormBody', 100)
            var ret=await axios.post("/api/regUser",{user:this.user});
            localStorage.setItem("user", JSON.stringify(ret.data));
            setTimeout(()=>{
             //   document.location.href="/player/"+lang;
                this.stage=10
            },1000)
        },
        login: async function () {
            this.checkEmail(this.user.email);

            if((  this.err.e  ))
                return;
            this.stage=0;
            localStorage.setItem("user", JSON.stringify(this.user));
            var ret=await axios.post("/api/loginUser",{user:this.user});
            if(ret.data.id){
                this.user=ret.data;
                localStorage.setItem("user", JSON.stringify(ret.data));
                setTimeout(()=>{
                    document.location.href="/player/"+lang;
                //this.stage=10; window.history.pushState("sber-pb", "sber-pb", "/index/"+lang)
                },2000)

            }
            else{
                setTimeout(( )=>{this.stage=4},2000)

            }
        },
        aliveUser:async function () {
            if(this.stage==10 || this.stage==5)
                await axios.post("/api/aliveUser",{id:this.user.id});
            setTimeout(()=>{this.aliveUser()}, 20*1000);
        },
        updateChat:async function(){
            try {
                //var ret = await axios.get("/api/chat");
               // this.chat = ret.data.chat;
                //this.q = ret.data.q;
                var objDiv = document.getElementById("qBox");
                if(objDiv!=null)
                        objDiv.scrollTop = objDiv.scrollHeight;

                 objDiv = document.getElementById("chatBox");
                if(objDiv!=null)
                        objDiv.scrollTop = objDiv.scrollHeight;
            }
            catch (e) {
                console.warn(e)
            }
            setTimeout(()=>{this.updateChat()},5*1000)


        },
        showSpeaker:function (spk) {
            this.activeSpk=spk;
            console.log(spk)
        }

    },
    watch:{
        activeSpk:function(){
            if (this.activeSpk)
                document.body.style.overflow = "hidden";
            else
                document.body.style.overflow = "scroll";
        },
        promice:function(){

            this.user.promice=this.promice;
        },
        chatIsActive:function() {
            setTimeout(()=>{
                    var objDiv = document.getElementById("qBox");
                    if(objDiv!=null)
                        objDiv.scrollTop = objDiv.scrollHeight;
                    objDiv = document.getElementById("chatBox");
                    if(objDiv!=null)
                        objDiv.scrollTop = objDiv.scrollHeight;
            },0)
        },
        stage:async function () {
            if(this.stage==10){

                this.aliveUser();
            }
            if(this.stage==5){
                this.aliveUser();
                this.updateChat();
                window.history.pushState("/player/"+lang,"/player/"+lang,"/player/"+lang)
                var objDiv = document.getElementById("qBox");
                if(objDiv)
                        objDiv.scrollTop = objDiv.scrollHeight;
                objDiv = document.getElementById("chatBox");
                if(objDiv)
                        objDiv.scrollTop = objDiv.scrollHeight;
            }
        }
    },

    mounted:function () {
        var prom=this.user.promice;

        setTimeout(()=>{this.user.promice=false;this.loaded=true; },500)

        this.stage=stage;
        this.isLogin=(this.stage==3);
        this.isPlayer=(this.stage==5 || this.stage==6);
        var juser=localStorage.getItem("user")

        if(juser){
            try{

                this.user=JSON.parse(juser);
                this.user.promice=false;
                if(this.user.id && stage==1){
                   // document.location.href="/player/"+lang;
                    //this.stage=3;
                }

                if(!this.user.id)
                    this.stage=1;
                if(this.stage==5)
                    this.aliveUser();
            }
            catch (e) {
                console.warn(e)
            }
        }
        else{
            if(this.stage>6){
                console.log("stahe>1")
                document.location.href="/login/"+lang;
            }

        }
        setTimeout(()=>{
            var objDiv = document.getElementById("chatBox");
            if(objDiv!=null)
                objDiv.scrollTop = objDiv.scrollHeight;

            var queryString = window.location.href;
            if(window.location.href.indexOf("#general")>=0) {
                setTimeout(function(){
                    console.log("find",document.getElementById("general"));

                    document.getElementById("general").scrollIntoView();
                },0)

            }
            console.log("queryString",queryString);





                var eventTime = '1366549200';


                function  updateTimer(){
                    var currentTime = moment().unix();
                    var leftTime = eventTime - currentTime;//Now i am passing the left time from controller itself which handles timezone stuff (UTC), just to simply question i used harcoded values.
                    var duration = moment.duration(leftTime, 'seconds');
                    var interval = 1000;
                    duration = moment.duration(duration.asSeconds() - 1, 'seconds');
                    var ret="";
                    var d=duration.days();
                    if(d>0) {
                        ret += d
                        switch (d){
                            case 1: ret+=" день, ";break;
                            case 2: ret+=" дня, ";break;
                            case 3: ret+=" дня, ";break;
                            case 4: ret+=" дня, ";break;
                            default: ret+=" дней, ";
                        }
                    }
                    console.log( ret+ duration.hours()+ ':' + duration.minutes()+ ':' + duration.seconds());
                    setTimeout(updateTimer,interval)
                }


                //Otherwise







        },500)

    }
})
function changeLang(lang) {
    var href=document.location.href;
    href=href.substr(0, href.length-2)+lang;
    document.location.href=href
}
var EPPZScrollTo =
    {
        /**
         * Helpers.
         */
        documentVerticalScrollPosition: function()
        {
            if (self.pageYOffset) return self.pageYOffset; // Firefox, Chrome, Opera, Safari.
            if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop; // Internet Explorer 6 (standards mode).
            if (document.body.scrollTop) return document.body.scrollTop; // Internet Explorer 6, 7 and 8.
            return 0; // None of the above.
        },

        viewportHeight: function()
        { return (document.compatMode === "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight; },

        documentHeight: function()
        { return (document.height !== undefined) ? document.height : document.body.offsetHeight; },

        documentMaximumScrollPosition: function()
        { return this.documentHeight() - this.viewportHeight(); },

        elementVerticalClientPositionById: function(id)
        {
            var element = document.getElementById(id);
            var rectangle = element.getBoundingClientRect();
            return rectangle.top;
        },

        /**
         * Animation tick.
         */
        scrollVerticalTickToPosition: function(currentPosition, targetPosition)
        {
            var filter = 0.2;
            var fps = 60;
            var difference = parseFloat(targetPosition) - parseFloat(currentPosition);

            // Snap, then stop if arrived.
            var arrived = (Math.abs(difference) <= 0.5);
            if (arrived)
            {
                // Apply target.
                scrollTo(0.0, targetPosition);
                return;
            }

            // Filtered position.
            currentPosition = (parseFloat(currentPosition) * (1.0 - filter)) + (parseFloat(targetPosition) * filter);

            // Apply target.
            scrollTo(0.0, Math.round(currentPosition));

            // Schedule next tick.
            setTimeout("EPPZScrollTo.scrollVerticalTickToPosition("+currentPosition+", "+targetPosition+")", (1000 / fps));
        },

        /**
         * For public use.
         *
         * @param id The id of the element to scroll to.
         * @param padding Top padding to apply above element.
         */
        scrollVerticalToElementById: function(id, padding)
        {
            var element = document.getElementById(id);
            if (element == null)
            {
                console.warn('Cannot find element with id \''+id+'\'.');
                return;
            }

            var targetPosition = this.documentVerticalScrollPosition() + this.elementVerticalClientPositionById(id) - padding;
            var currentPosition = this.documentVerticalScrollPosition();

            // Clamp.
            var maximumScrollPosition = this.documentMaximumScrollPosition();
            if (targetPosition > maximumScrollPosition) targetPosition = maximumScrollPosition;

            // Start animation.
            this.scrollVerticalTickToPosition(currentPosition, targetPosition);
        }
    };

