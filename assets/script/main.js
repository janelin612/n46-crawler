"use strict";

var app = new Vue({
  el: "#app",
  data: {
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    selected: 0,
    list: [],
    member: {},
    isFold: false,
    isLoading: true
  },
  computed: {
    //指向目前選定的部落格文章
    currentPost: function currentPost() {
      if (this.list.length == 0 || this.selected < 0 || this.selected >= this.list.length) {
        return null;
      } else {
        return this.list[this.selected];
      }
    },
    //由date計算出來實際要顯示的日期樣式物件
    currentPostDate: function currentPostDate() {
      if (this.currentPost == null) {
        return {
          yearMonth: "",
          date: "",
          weekday: ""
        };
      } else {
        var time = new Date(this.currentPost.datetime);
        var month = this.formatNumber(time.getMonth() + 1);
        var date = this.formatNumber(time.getDate());
        return {
          yearMonth: time.getFullYear() + "/" + month,
          date: date,
          weekday: this.weekday[time.getDay()]
        };
      }
    }
  },
  methods: {
    onListSelected: function onListSelected(index) {
      window.scrollTo(0, 0);
      this.isFold = true;
      this.selected = index;
      var obj = {
        Url: window.location.toString().split("?")[0] + "?no=" + index
      };
      history.replaceState(obj, document.title, obj.Url);
    },
    onToggle: function onToggle() {
      this.isFold = !this.isFold;
    },

    /** 一位數字前面補零 */
    formatNumber: function formatNumber(num) {
      return num > 9 ? `${num}` : `0${num}`;
    }
  },
  created: function created() {
    var _this = this;

    if (typeof defaultList !== 'undefined') {
      this.list = defaultList;
    }

    if (typeof defaultMember !== 'undefined') {
      this.member = defaultMember;
    }

    fetch("./member.json").then(function (resp) {
      return resp.json();
    }).then(function (json) {
      _this.member = json;

      if ('name' in _this.member) {
        document.title = `${_this.member.name} | 乃木坂46卒業メンバーのブログ`;
      }
    }).catch(function (err) {
      console.log(err);
    });
    fetch("./result.json").then(function (resp) {
      return resp.json();
    }).then(function (json) {
      _this.isLoading = false;
      _this.list = json;
      var no = new URL(window.location).searchParams.get("no");

      if (no != null && no != '') {
        _this.selected = new Number(no);
        Vue.nextTick().then(function () {
          //第一次開啟時將卷軸捲到正確的位置
          var dom = document.querySelector(".menu li:first-of-type");
          var liHeight = dom.scrollHeight;
          document.querySelector(".menu").scrollTop = liHeight * _this.selected;
        });
      }
    }).catch(function (err) {
      _this.isLoading = false;
      console.log(err);
    });
  }
});