var app = new Vue({
  el: '#app',
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
    currentPost() {
      if (
        this.list.length == 0 ||
        this.selected < 0 ||
        this.selected >= this.list.length
      ) {
        return null;
      } else {
        return this.list[this.selected];
      }
    },
    //由date計算出來實際要顯示的日期樣式物件
    currentPostDate() {
      if (this.currentPost == null) {
        return {
          yearMonth: '',
          date: '',
          weekday: ''
        };
      } else {
        let time = new Date(this.currentPost.datetime.replace(/\./g, '/'));
        let month = this.formatNumber(time.getMonth() + 1);
        let date = this.formatNumber(time.getDate());
        return {
          yearMonth: time.getFullYear() + '/' + month,
          date: date,
          weekday: this.weekday[time.getDay()]
        };
      }
    }
  },
  methods: {
    onListSelected: function (index) {
      window.scrollTo(0, 0);
      this.isFold = true;
      this.selected = index;
      let url = window.location.origin + window.location.pathname;
      let param = new URLSearchParams();
      param.set('no', index);
      var obj = {
        Url: `${url}?${param.toString()}`
      };
      history.replaceState(obj, document.title, obj.Url);
    },
    onToggle: function () {
      this.isFold = !this.isFold;
    },
    /** 一位數字前面補零 */
    formatNumber: function (num) {
      return num > 9 ? `${num}` : `0${num}`;
    }
  },
  async created() {
    try {
      this.member = await (await fetch('./member.json')).json();
      if ('name' in this.member) {
        document.title = `${this.member.name} | 乃木坂46卒業メンバーのブログ`;
      }
    } catch (error) {
      console.warn(error);
    }

    try {
      this.list = await (await fetch('./result.json')).json();
      this.isLoading = false;
      let no = new URL(window.location).searchParams.get('no');
      if (no != null && no != '') {
        this.selected = new Number(no);
        await Vue.nextTick();
        //第一次開啟時將卷軸捲到正確的位置
        let dom = document.querySelector('.menu li:first-of-type');
        let liHeight = dom.scrollHeight;
        document.querySelector('.menu').scrollTop = liHeight * this.selected;
      }
    } catch (error) {
      console.warn(error);
      this.isLoading = false;
    }
  }
});
