var pgm=new Vue({
    el: "#app",
    data: {
        streams:[],
        mixers:[]
    },
    methods: {
        getIframe:function(){
            return 'https://wowza02.onevent.online:8888/embed_player?urlServer=wss://wowza02.onevent.online:8443&streamName='+this.mixers[0].localStreamName+'&mediaProviders=WSPlayer&autostart=true&muted=true'
        },
        stopMixer: async function(item) {
            if(confirm("Вы удаляете микшер!")){
                var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/mixer/terminate", {
                    uri: this.mixers[0].uri,

                });

                setTimeout(async () => {
                    await this.reloadMixers();
                }, 500)
            }
        },
        startPreview:async function(){
            startPreview();
        },
        delFromMixer: async function(item) {
            var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/mixer/remove", {
                uri: this.mixers[0].uri,
                remoteStreamName: item.name
            });

            setTimeout(async ()=>{ await this.reloadMixers();}, 500)
        },
        GetSnapshot: async function(item) {
            var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/stream/snapshot", {

                streamName: item.name
            });
           var elem=document.createElement("div");
            elem.classList.add("fullscreenwr")
            var img=document.createElement("img");
           img.src="data:image/png;base64, "+dt.data.data;
            elem.appendChild(img);
           document.body.appendChild(elem)
            elem.onclick=function(){elem.parentNode.removeChild(elem)}
            setTimeout(async ()=>{ await this.reloadMixers();}, 500)
        },
        addToMixer: async function(item) {
            var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/mixer/add", {
                uri: this.mixers[0].uri,
                remoteStreamName: item.name
            });
            setTimeout(async ()=>{ await this.reloadMixers();}, 500)
        },
        startMixer:async function () {
            var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/mixer/startup", {
                "uri": "mixer://mixer1",
                "localStreamName": "mixer1_stream",
                "hasVideo": true,
                "hasAudio": false,
                "mixerLayoutClass": "com.flashphoner.mixerlayout.CenterNoPaddingGridLayout",//TestLayout",
                "background": "/tmp/bg.png"
            });
            await this.reloadMixers();
        },
        reloadMixers:async function(){
            try {
                var users=(await axios.get("/api/videoUsers")).data;
                var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/stream/find_all");
                this.streams = dt.data.filter(s=>s.mediaType=="publish");

                this.streams.forEach(s => {
                    try {
                        let user=users.filter(u=>u.id==s.name)
                        if(user.length>0)
                            s.user=user[0]
                        else
                            s.user=[]
                        //s.user = s.name;//JSON.parse(s.name);
                    } catch (e) {
                        console.warn(e)
                    }
                })
                this.streams.forEach(s=>{
                        s.inMixer=false;
                })
            } catch (e) {
                this.streams=[];
            }
            try{
                dt = await axios.get("https://wowza02.onevent.online:8444/rest-api/mixer/find_all");
                this.mixers = dt.data;//.filter(s=>s.mediaType=="mixer");
                console.log("this.streams",this.streams)

                if(this.mixers.length>0)
                this.mixers[0].mediaSessions.forEach(m=>{
                    this.streams.forEach(s=>{
                        console.log(m.localMediaSessionId,s.mediaSessionId)
                        if(m.localMediaSessionId==s.mediaSessionId){
                            s.inMixer=true;
                        }
                    })

                })
            }catch (e) {
                this.mixers=[]
            }


            try {
                var dt = await axios.post("https://wowza02.onevent.online:8444/rest-api/mixer/find_all");
            }
            catch (e) {
                console.warn(e)
            }
        }
    },
    mounted:async  function () {
        await this.reloadMixers();

    }
});


function startPreview(){

     var remoteVideo = document.getElementById("previewVideo");
    remoteVideo.innerHTML="<iframe id='fp_embed_player' src='https://wowza02.onevent.online:8888/embed_player?urlServer=wss://wowza02.onevent.online:8443&streamName="+pgm.mixers[0].localStreamName+"&mediaProviders=WSPlayer' marginwidth='0' marginheight='0' frameborder='0' width='100%' height='100%' scrolling='no' allowfullscreen='allowfullscreen'></iframe>"


}