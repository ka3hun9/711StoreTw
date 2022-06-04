import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import qs from "qs";
import { XMLParser } from "fast-xml-parser";

/**
 * 711店铺 - 台湾
 */
let state = "";
let town = "";
let road = "";

const _url = "https://emap.pcsc.com.tw/EMapSDK.aspx";

const _root = [
  ["01", "台北市"],
  ["02", "基隆市"],
  ["03", "新北市"],
  ["04", "桃園市"],
  ["05", "新竹市"],
  ["06", "新竹縣"],
  ["07", "苗栗縣"],
  ["08", "台中市"],
  ["10", "彰化縣"],
  ["11", "南投縣"],
  ["12", "雲林縣"],
  ["13", "嘉義市"],
  ["14", "嘉義縣"],
  ["15", "台南市"],
  ["17", "高雄市"],
  ["19", "屏東縣"],
  ["20", "宜蘭縣"],
  ["21", "花蓮縣"],
  ["22", "台東縣"],
  ["23", "澎湖縣"],
  ["24", "連江縣"],
  ["25", "金門縣"],
].map((item) => ({
  label: item[1],
  value: item[1],
  state: item[1],
  serial: item[0],
  children: [],
}));

// 请求调度
async function requesDispatcher(parent, { serial, state, town, road }) {
  let temp = null;
  switch (true) {
    case !!road:
      temp = await GetStore(state, town, road);
      break;
    case !!town:
      temp = await GetRoad(state, town);
      break;
    case !!serial:
      temp = await GetTown(serial);
      break;
  }
  temp && (parent.children = temp);
  return temp;
}

// 通用请求
async function requestHandler(options, filed, callback) {
  const { status, data } = await axios.post(_url, qs.stringify(options));
  console.log(options, data);
  if (status === 200) {
    const parser = new XMLParser().parse(data);
    const fileds = parser.iMapSDKOutput[filed];
    if (Array.isArray(fileds)) {
      return fileds.map(callback);
    } else if (fileds) {
      return [callback(fileds)];
    } else {
      return [];
    }
  } else {
    throw new Error(`${filed} 请求错误.`);
  }
}

// 获取分区
async function GetTown(serial) {
  const options = {
    commandid: "GetTown",
    cityid: serial,
    leftMenuChecked: "",
  };
  return await requestHandler(options, "GeoPosition", (item) => ({
    label: item.TownName,
    value: item.TownName,
    town: item.TownName,
    children: [],
  }));
}

// 获取路段
async function GetRoad(state, town) {
  const options = {
    commandid: "SearchRoad",
    city: state,
    town: town,
    ID: "",
    StoreName: "",
    SpecialStore_Kind: "",
    leftMenuChecked: "",
  };
  return await requestHandler(options, "RoadName", (item) => ({
    label: item.rd_name_1 + item.section_1,
    value: item.rd_name_1 + item.section_1,
    road: item.rd_name_1 + item.section_1,
    children: [],
  }));
}

// 获取店址
async function GetStore(state, town, road) {
  const options = {
    commandid: "SearchStore",
    city: state,
    town: town,
    roadname: road,
    ID: "",
    StoreName: "",
    SpecialStore_Kind: "",
    leftMenuChecked: "",
    address: "",
  };
  return await requestHandler(options, "GeoPosition", (item) => ({
    label: `<${item.POIName}> ${item.Address}`,
    value: `<${item.POIName}> ${item.Address}`,
  }));
}

// 队列
(function queue(root) {
  let source = root.map(
    (item, index) =>
      async function () {
        state = item.state ? item.state : state;
        town = item.state ? "" : item.town ? item.town : town;
        road = item.state ? "" : item.town ? "" : item.road ? item.road : road;

        const next = source[++index];
        const parent = await requesDispatcher(item, {
          serial: item.serial,
          state,
          town,
          road,
        });

        if (parent[0] && typeof parent[0].children !== "undefined") {
          await queue(parent)[0]();
        }

        if (!next) {
          fs.writeFileSync(
            path.resolve(process.cwd(), "./dist/output.json"),
            JSON.stringify(_root)
          );
        } else {
          await next();
        }
      }
  );
  return source;
})(_root)[0]();
