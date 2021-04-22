var login=new Vue({
    el:"#app",
    data:{
        user:{f:"",i:"",code:"",dept:{id:null, title:"Подразделение*"}},
        err:{f:false, i:false, code:false,dept:false, codeUncorrect:false},
        showDeptDialog:false,
        dept:dept,
        isLoad:false

    },
    methods:{
        void:function(){;;},
        deptChange:function(item){
            this.user.dept=item;

            setTimeout(()=>{ this.showDeptDialog=false; this.err.dept=false;},0)
        },
        register:async function(){
            this.checkf(this.user.f);
            this.checkCode(this.user.code);
                     if(this.err.f || this.err.code )
                return;
            this.isLoad=true;
            var res=await axios.post("/api/registerUser",this.user);
            if(res.data.status<0)
                return setTimeout(()=>{ this.err.codeUncorrect=true;this.isLoad=false},1000)
            setTimeout(()=>{
                document.location.href=("/index/");
            },1000)
        },
        checkDep:function(f){

            this.err.dept=this.user.dept.id==null;
        },
        checkf:function(f){
            this.err.f=false ;
            if(f.length<2)
                return  this.err.f=true;
            f=f.replace(/\s+/g," ");
            var m=f.match(/([а-яА-ЯЁё\s\-]{2,120})/);
            if(!m)
                return this.err.f = true;
            //this.user.f=m[1].substr(0,1).toUpperCase()+m[1].substring(1);
            this.err.f=false;
        },
        checki:function(f){
            this.err.i=false ;
            if(f.length<2)
                return  this.err.i=true;
            f=f.replace(/\s/g,"");
            var m=f.match(/([а-яА-ЯЁё\-]{2,120})/);
            if(!m)
                return this.err.i = true;
            this.user.i=m[1].substr(0,1).toUpperCase()+m[1].substring(1);
        },
        checkCode:function(f){
            this.err.code=false ;
            if(f.length<5)
                return  this.err.code=true;
            f=new String(f);
            var m=f.match(/([\d]{5,10})/);

            if(!m)
                return this.err.code = true;
            var d=parseInt(m[1])
            this.user.code=d;
            this.err.codeUncorrect=false;
        }
    },
    watch:{


},
    mounted:function () {
      console.log("vue login")
    }

})