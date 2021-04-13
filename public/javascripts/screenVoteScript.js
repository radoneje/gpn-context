var pgm=new Vue({
    el:"#app",
    data:{
        votes:[],
    },
    methods:{
        updateVote:async function(){
            try {
                var ret = await axios.get("/api/votes");
                this.votes = ret.data;
                this.votes.forEach(v=>{v.iscompl=true;})
            }
            catch (e) {
                console.warn(e)
            }
            setTimeout(()=>{this.updateVote()},10*1000)
        },
    },
    watch: {
    },
    mounted:function () {
        this.updateVote();
        setTimeout(()=>{   document.body.style.opacity=1;
        },500)
    }

})

