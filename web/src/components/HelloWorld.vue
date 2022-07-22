<template>
  <div class="hello">
    <el-row> </el-row>
    <el-row :gutter="20">
      <el-col :span="9" :offset="7">
        <el-autocomplete
          class="inline-input"
          v-model="input"
          :fetch-suggestions="querySearch"
          placeholder="请输入内容"
          @select="handleSelect"
          :trigger-on-focus="false"
          style="width: 600px"
        ></el-autocomplete
      ></el-col>
      <el-col :span="2"
        ><el-button
          type="primary"
          @click.native="
            query();
            graph();
          "
          >查询</el-button
        >
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="3" :offset="10">
        <h2>新闻来源</h2>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="3" :offset="7">
        <el-image
          :src="require('../assets/中新网.png')"
          fit="cover"
          style="width: 50px"
        ></el-image>
      </el-col>
      <el-col :span="3">
        <el-image
          :src="require('../assets/网易.png')"
          fit="cover"
          style="width: 50px"
        ></el-image>
      </el-col>
      <el-col :span="3">
        <el-image
          :src="require('../assets/人民网.png')"
          fit="cover"
          style="width: 50px"
        ></el-image>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="3" :offset="7">
        <a href="https://www.chinanews.com.cn/" target="_blank"> 中国新闻网 </a>
      </el-col>
      <el-col :span="3">
        <a href="https://news.163.com/" target="_blank"> 网易新闻 </a>
      </el-col>
      <el-col :span="3">
        <a href="https://sports.sina.com.cn/" target="_blank"> 人民网 </a>
      </el-col>
    </el-row>

    <el-row :gutter="8">
      <el-col :span="6" :offset="7">
        <div style="width: 700px; height: 300px" ref="chart"></div>
      </el-col>
      <el-col offset="7">
        <el-table
          :data="search_infos"
          style="width: 100%"
          :default-sort="{ prop: 'date', order: 'descending' }"
          max-height="500"
          v-if="show"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="出版日期">
                  <span>{{ props.row.publish_date.substring(0, 10) }}</span>
                </el-form-item>
                <el-form-item label="标题">
                  <span>{{ props.row.title }}</span>
                </el-form-item>
                <el-form-item label="作者">
                  <span>{{ props.row.author }}</span>
                </el-form-item>
                <el-form-item label="关键词">
                  <span>{{ props.row.keywords }}</span>
                </el-form-item>
                <el-form-item label="原文链接">
                  <el-link :href="props.row.url" target="_blank">
                    {{ props.row.url }}
                  </el-link>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            prop="publish_date"
            label="日期"
            width="180"
            sortable
          >
          </el-table-column>
          <el-table-column prop="title" label="名称" width="180">
          </el-table-column>
          <el-table-column prop="author" label="作者" width="180">
          </el-table-column>
          <el-table-column prop="source_name" label="来源" width="180" sortable>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ClientRequest } from "http";
import news_json from "../assets/news.json";

let Echarts = require("echarts/lib/echarts"); //基础实例 注意不要使用import
require("echarts/lib/chart/line");

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      input: "",
      chart: null,
      x: [],
      y: [],
      search_infos: [],
      dates: [],
      values: [],
      show: false,
      reconmands: null,
    };
  },

  mounted() {
    (this.recommands = news_json.RECORDS), (this.restaurants = this.loadAll());
  },

  methods: {
    querySearch(queryString, cb) {
      var recommands = this.recommands;
      var results = queryString
        ? recommands.filter(this.createFilter(queryString))
        : recommands;
      // 调用 callback 返回建议列表的数据
      console.log(results);
      cb(results);
    },
    createFilter(queryString) {
      return (recommand) => {
        return (
          recommand.value.toLowerCase().indexOf(queryString.toLowerCase()) !==
          -1
        );
      };
    },

    query() {
      var input = this.input;
      console.log(input);
      this.$http
        .post("/api/search", {
          title: input,
        })
        .then((response) => {
          this.search_infos = [];
          console.log(response.body);
          for (var i = 0; i < response.body.length; i++) {
            response.body[i].publish_date = response.body[
              i
            ].publish_date.substring(0, 10);
            this.search_infos.push(response.body[i]);
          }
        });
    },
    graph() {
      var input = this.input;
      this.$http
        .post(
          "/api/graph",
          {
            title: input,
          },
          {}
        )
        .then((response) => {
          this.dates = [];
          this.values = [];
          console.log(response.body);
          for (var i = 0; i < response.body.length; i++) {
            this.dates.push(response.body[i].publish_date.substring(0, 10));
            this.values.push(response.body[i]["COUNT(*)"]);
          }
          console.log(this.dates);
          this.show = true;
          this.chart = Echarts.init(this.$refs.chart);
          //3.配置数据
          let option = {
            title: {
              show: true,
              text: '关键词"' + this.input + '"出现频次',
            },
            xAxis: {
              type: "category",
              data: this.dates,
            }, //X轴
            yAxis: { type: "value" }, //Y轴
            series: [{ data: this.values, type: "line" }], //配置项
          };
          // 4.传入数据
          this.chart.setOption(option);
        });
    },
    handleSelect(item) {
      console.log(item);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
