var app = new Vue({
    el: "#app",
    data: {
        weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        selected: 0,
        list: [],
        member: {},
        isFold: false,
        isLoading:true
    },
    computed: {
        //指向目前選定的部落格文章
        currentPost: function () {
            if (this.list.length == 0 || this.selected < 0 || this.selected >= this.list.length) {
                return null;
            } else {
                return this.list[this.selected];
            }
        },
        //由date計算出來實際要顯示的日期樣式物件
        currentPostDate: function () {
            if (this.currentPost == null) {
                return {
                    yearMonth: "",
                    date: "",
                    weekday: ""
                }
            } else {
                var time = new Date(this.currentPost.datetime);
                var month = (time.getMonth() + 1) > 9 ? "" + (time.getMonth() + 1) : "0" + (time.getMonth() + 1);
                var date = time.getDate() > 9 ? "" + time.getDate() : "0" + time.getDate();
                return {
                    yearMonth: time.getFullYear() + "/" + month,
                    date: date,
                    weekday: this.weekday[time.getDay()]
                }
            }
        }
    },
    methods: {
        onListSelected: function (index) {
            window.scrollTo(0, 0);
            this.isFold = true;
            this.selected = index;
            var obj = { Url: window.location.toString().split("?")[0] + "?no=" + index };
            history.replaceState(obj, document.title, obj.Url);
        },
        onToggle: function () {
            this.isFold = !this.isFold;
        }
    },
    created: function () {
        fetch("./member.json")
            .then((resp) => {
                return resp.json();
            })
            .then((json) => {
                this.member = json;
                if ('name' in this.member) {
                    document.title = this.member.name + " 非公式ブログ";
                }
            })
            .catch((err) => {
                console.log(err);
            })
        fetch("./result.json")
            .then((resp) => {
                return resp.json();
            })
            .then((json) => {
                this.isLoading=false;
                this.list = json;
                let no = new URL(window.location).searchParams.get("no");
                if (no != null && no != '') {
                    this.selected = new Number(no);
                    Vue.nextTick()
                        .then(() => {
                            //第一次開啟時將卷軸捲到正確的位置
                            let dom = document.querySelector(".menu li:first-of-type");
                            let liHeight = dom.scrollHeight;
                            document.querySelector(".menu").scrollTop = liHeight * (this.selected);
                        })
                }
            })
            .catch((err) => {
                this.isLoading=false;
                console.log(err);
            })
    },
});