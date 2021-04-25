const serverUrl = "wss://wowza02.onevent.online:8443";
//if(typeof(roomid)!="undefined"  && roomid>90)
//var serverUrl = "wss://phone02.sber.link:8443";
var user=JSON.parse(localStorage.getItem("usr"));
console.log(user)


const SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
const STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
const STREAM_STATUS_INFO = Flashphoner.constants.STREAM_STATUS_INFO;


//enableCamera().then(s=>{});
phonerInit();
async function enableCamera() {
    var videoElem = document.getElementById("videoCamera");
    videoElem.controls = false;

    var stream = await navigator.mediaDevices.getUserMedia({video: {width: 640, height: 360}});
    videoElem.srcObject = stream;
    videoElem.muted = true;
    videoElem.play();


}
function phonerInit(){
    var stream;
    Flashphoner.init({flashMediaProviderSwfLocation: '../../../../media-provider.swf'});
    Flashphoner.createSession({urlServer: serverUrl}).on(SESSION_STATUS.ESTABLISHED, function(session){
        //session connected, start streaming
        console.log("session connected, start streaming");
        startStreaming(session);
    }).on(SESSION_STATUS.DISCONNECTED, function(){
        setStatus(SESSION_STATUS.DISCONNECTED);
        console.warn("SESSION_STATUS.DISCONNECTED")
    }).on(SESSION_STATUS.FAILED, function(){
        setStatus(SESSION_STATUS.FAILED);
        console.warn("SESSION_STATUS.FAILED")
        retryToRestart();
    });
    function retryToRestart(){
        if (retryCount < retryMaxTimes){
            setTimeout(function(){
                if (stream   && (stream.status() != STREAM_STATUS.PLAYING)){
                    playStream();
                    retryToRestartTimeout = retryToRestartTimeout + addMilesecondsToRestartTryOnEveryFailed;
                    retryCount++;
                }
            },retryToRestartTimeout);
        }
    }
    function startStreaming(session) {
        stream =session.createStream({
            name: JSON.stringify({i:user.i,f:user.f,id:user.id}),
            display: document.getElementById("cameraBox"),
            cacheLocalResources: true,
            constraints:{audio:false,video: {width: 320, height: 180} },
        })
        stream.publish();




    }
}

