var pgm=new Vue({
    el:"#app",
    data:{
        content:content,
        pgmItem:content.pgm[0],
        speakers:speakers,
        playerSect:1,
        qText:"",
        q:[],
        chat:[],
        chatTextSend:false,
        chatText:"",
        messages:[],
        votes:[],
        tags:[],
        tag:{},
        isTagsCompl:{},
        myVotes:[],
        myVote:{},
        state:{q:true, chat:true},
        isCamera:isCamera
    },
    methods:{
        qLike:async function(item){
                if(!localStorage.getItem("qLike"+item.id)) {
                    var ret=await axios.post("/api/qLike", {id: item.id})
                    localStorage.setItem("qLike" + item.id, true);
                    this.q.forEach(q=>{
                        if(q.id==item.id)
                            q.likes=ret.data.likes;
                    })
                }
                else {
                    var ret=await axios.post("/api/qUnLike", {id: item.id})
                    localStorage.removeItem ("qLike" + item.id);
                    this.q.forEach(q=>{
                        if(q.id==item.id)
                            q.likes=ret.data.likes;

                    })
                }

        },
        tagsResShow:function(item){
            window.open('/tagsres/'+item.id)
        },
        checkVoteFull:function(vote){
            return this.myVotes.filter(v=>v.voteid==vote.id ).length>0
        },
        checkVote: function(answer){


            return this.myVotes.filter(v=>v.voteid==answer.voteid && v.id==answer.id).length>0
        },
        tagsSend:async function(vote) {

            if (!this.tag["id"+vote.id])
                return;
            this.isTagsCompl["id" + vote.id] = true;
            var json = JSON.stringify(this.isTagsCompl)
            localStorage.setItem("tags", json);

            this.tags = this.tags.filter(r => {
                return true
            })
            await axios.post("/api/tagsDo",{id:vote.id, text:this.tag["id"+vote.id]})
        },
        checkVoteReady:function(answer){

            if(!this.myVote["id"+answer.voteid])
            return false;
            return this.myVote["id"+answer.voteid].id==answer.id;
        },
        voting:async function(answer){

            if(this.checkVoteFull({id:answer.voteid}))
                return;
             this.myVote["id"+answer.voteid]={voteid:answer.voteid, id:answer.id};
             this.votes=this.votes.filter(v=>{return true})
             return ;

        },
        votingSend:async function(vote){
            var len=this.myVotes.length;
            var old=this.myVotes.filter(v=>v.voteid==vote.id);
            if(old.length>0){
                // await axios.post("/api/unvote",old);
                this.myVotes=this.myVotes.filter(v=>v.voteid!=vote.id);
            }
            this.myVotes.push(this.myVote["id"+vote.id]);
            await axios.post("/api/voting",this.myVote["id"+vote.id]);
            localStorage.setItem("votes",JSON.stringify(this.myVotes) )
        },
        updateVote:async function(){
            try {
                var ret = await axios.get("/api/votes");
                this.votes = ret.data.votes;
                this.tags = ret.data.tags;
            }
            catch (e) {
                console.warn(e)
            }
            setTimeout(()=>{this.updateVote()},20*1000)

        },
        updateChat:async function(){

            try {
                var ret = await axios.post("/api/aliveUser");
                this.chat = ret.data.chat;
                this.q = ret.data.q;
                this.state = ret.data.state;
                this.messages=ret.data.messages;
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
            setTimeout(()=>{this.updateChat()},20*1000)


        },
        newQ:async function(){
            this.chatTextSend=true
            try{

                if(this.qText.length>0){
                    var ret=await axios.post("/api/q",{text:this.qText});
                    this.qText="";
                    this.q.push(ret.data);
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
        newChat:async function(){
            this.chatTextSend=true
            try{

                if(this.chatText.length>0){
                    var ret=await axios.post("/api/chat",{text:this.chatText});
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
        getSpkInit:function(spk){
            var ret=spk.f;
            if(!spk.i || spk.i.length==0)
                return ret;
            ret+=" "+ spk.i.substr(0,1).toUpperCase()+"."
            if(!spk.o || spk.o.length==0)
                return ret;
            ret+=""+ spk.o.substr(0,1).toUpperCase()+"."
            return ret;
        },
        getSpeakes:function (users) {
            var ret=[];
            this.speakers.forEach(s=>{
                if(users)
                    users.forEach(ss=>{
                    if(s.id==ss.id) {
                        s.theme=ss.theme
                        ret.push(s)
                    }
                })
            })
            ret.sort(function(a, b){
                if(a.f < b.f) { return -1; }
                if(a.f > b.f) { return 1; }
                return 0;
            })
            return ret;
        },
        getModerators:function (event) {
            var ret=[];
            this.speakers.forEach(s=>{
                if(event.moderators)
                    event.moderators.forEach(ss=>{
                        if(s.id==ss)
                            ret.push(s)
                    })
            })
            console.log("speakers", ret)
            return ret;
        }
        ,
        getUsers:function (event) {
            var ret=[];
            this.speakers.forEach(s=>{
                if(event.users)
                    event.users.forEach(ss=>{
                        if(s.id==ss)
                            ret.push(s)
                    })
            })
            console.log("speakers", ret)
            return ret;
        }
    },
    watch: {
        promice: function () {

            this.user.promice = this.promice;
        },
        chatIsActive: function () {
            setTimeout(() => {
                var objDiv = document.getElementById("qBox");
                if (objDiv != null)
                    objDiv.scrollTop = objDiv.scrollHeight;
                objDiv = document.getElementById("chatBox");
                if (objDiv != null)
                    objDiv.scrollTop = objDiv.scrollHeight;
            }, 0)
        },
        playerSect: function () {
            setTimeout(() => {
                var objDiv = document.getElementById("qBox");
                if (objDiv != null)
                    objDiv.scrollTop = objDiv.scrollHeight;
                objDiv = document.getElementById("chatBox");
                if (objDiv != null)
                    objDiv.scrollTop = objDiv.scrollHeight;
            }, 0)
        },
    },
    mounted:async function () {
        try {
            var jsonvotes = localStorage.getItem("votes")
            if (jsonvotes) {
                this.myVotes = JSON.parse(jsonvotes)

            }
            var json =localStorage.getItem("tags");
            if(json)
                this.isTagsCompl=JSON.parse(json)

        }catch (e) {
           console.warn(e)
        }
        setTimeout(()=>{   document.body.style.opacity=1;
        },500)
        this.updateChat();
        this.updateVote();
        setTimeout(()=>{
            var objDiv = document.getElementById("qBox");
            if (objDiv != null)
                objDiv.scrollTop = objDiv.scrollHeight;
        },1000)
        if(isCamera){
            var videoElem=document.getElementById("videoCamera");
            var stream = await navigator.mediaDevices.getUserMedia({video:{width:640,height:360}});
            videoElem.srcObject=stream;
            videoElem.muted=true;
            videoElem.play();
            videoElem.controls=false;
        }

    }

})
window.addEventListener("scroll",(e)=>{

    var a=window.scrollY;
   // if(a>200);
    //    a=200;
  /*  var pers=1-parseFloat(a)/200;
    var elem=document.getElementById("headLayer02");
    elem.style.top=(20*pers)+"px";

     pers=parseFloat(a)/200;
    elem=document.getElementById("headLayer03");
    elem.style.top=(-10+20*pers)+"px";
    var pers=1-parseFloat(a)/200;
    var elem=document.getElementById("headLayer01");
    elem.style.top=(20*pers)+"px";*/
/*var elem=document.getElementById("headerMenuWr")
  if(a>69 && elem.style.top!="0px")
      elem.style.top="0px"
  if(a<=69 && elem.style.top=="0px")
        elem.style.top="-89px"*/


})
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
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}