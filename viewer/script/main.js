var app = new Vue({
    el: "#app",
    data: {
        weekday:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        firstTimeUpdate:true,
        selected: 0,
        list: [],
        member: {},
        isFold:false
    },
    computed:{
        //指向目前選定的部落格文章
        currentPost:function(){
            if(this.list.length==0 || this.selected<0 ||this.selected>=this.list.length ){
                return null;
            }else{
                return this.list[this.selected];
            }
        },
        //由date計算出來實際要顯示的日期樣式物件
        currentPostDate:function(){
            if(this.currentPost==null){
                return {
                    yearMonth:"",
                    date:"",
                    weekday:""
                }
            }else{
                var time = new Date(this.currentPost.datetime);
                var month=(time.getMonth()+1)>9?""+(time.getMonth()+1):"0"+(time.getMonth()+1);
                var date=time.getDate()>9?""+time.getDate():"0"+time.getDate();
                return {
                    yearMonth:time.getFullYear()+"/"+month,
                    date:date,
                    weekday:this.weekday[time.getDay()]
                }
            }
        }
    },
    methods: {
        onListSelected: function (index) {
            window.scrollTo(0, 0);
            this.isFold=true;
            this.selected = index;
            var obj = { Url: window.location.toString().split("?")[0] + "?no=" + index };
            history.replaceState(obj, document.title, obj.Url);
        },
        onToggle:function(){
            this.isFold=!this.isFold;
        }
    },
    created: function () {
        this.$http.get("./result.json").then(res => { this.list = res.body }, res => { this.list = [] });
        this.$http.get("./member.json").then(res => { this.member = res.body }, res => { this.member = {} });

        var no = new URL(window.location).searchParams.get("no");
        if (no != null && no != '') {
            this.selected = no;
        }
    },
    updated:function(){
        
        if(this.firstTimeUpdate){
            //更改網站標題
            if('name' in this.member){
                document.title=this.member.name+" 非公式ブログ";
            }

            //第一次開啟時將卷軸捲到正確的位置
            var dom=this.$el.querySelector(".menu li");
            if(dom!=null){
                var single=dom.scrollHeight;
                this.$el.querySelector(".menu").scrollTop=single*(this.selected);
                this.firstTimeUpdate=false;
            }
        }
    }
});