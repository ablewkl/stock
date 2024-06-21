<script setup>
import { ref, reactive } from 'vue'
import TheWelcome from '../components/TheWelcome.vue'
import { xinxi, xinxic } from '../stockdata/xinxi'
import { hszs, hszsc } from '../stockdata/hszs'
import { zz1000, zz1000c } from '../stockdata/zz1000'
import { zz500, zz500c } from '../stockdata/zz500'
import { zzhl, zzhlc } from '../stockdata/zzhl'
import { bpetf, bpetfc } from '../stockdata/bpetf'
import { szzz, szzzc } from '../stockdata/szzz'
import { hsetf, hsetfc } from '../stockdata/hsetf'
import { kccy, kccyc } from '../stockdata/kccy'
import { nzetf, nzetfc } from '../stockdata/nzetf'

const selectOptions = [
  { label: '标普信息科技', value: '1' },
  { label: '沪深300', value: '2' },
  { label: '中证1000', value: '3' },
  { label: '中证500', value: '4' },
  { label: '中证红利', value: '5' },
  { label: '标普500ETF', value: '6' },
  { label: '上证综指', value: '7' },
  { label: '恒生ETF', value: '8' },
  { label: '科创创业', value: '9' },
  { label: '纳指ETF', value: '10' },
]
const curEtf = ref('2')
const base = ref('1')
let sourcedata = {}
const resArr = ref([])
// <h2>1:标普信息科技(161128);2:沪深300:(510310);3:中证1000:(512100);4:中证500:(561550);5:中证红利(515080);</h2>
// <h2>6:标普500ETF(513500);7:上证综指:(510760);8:恒生ETF:(159920);9:科创创业:(159781);10:纳指ETF</h2>

const currArr = []
const openchgRes = ref('')
const openchg = ref('0')
function selectEtf() {
  switch (curEtf.value) {
    //标普信息科技
    case '1':
      if (base.value === '1') {
        sourcedata = xinxi;
      } else {
        sourcedata = xinxic;
      }
      break
    //沪深300
    case '2':
      if (base.value === '1') {
        sourcedata = hszs;
      } else {
        sourcedata = hszsc;
      }
      break
    //中证1000
    case '3':
      if (base.value === '1') {
        sourcedata = zz1000;
      } else {
        sourcedata = zz1000c;
      }
      break
    //中证500
    case '4':
      if (base.value === '1') {
        sourcedata = zz500;
      } else {
        sourcedata = zz500c;
      }
      break
    //中证红利
    case '5':
      if (base.value === '1') {
        sourcedata = zzhl;
      } else {
        sourcedata = zzhlc;
      }
      break
    //标普etf
    case '6':
      if (base.value === '1') {
        sourcedata = bpetf;
      } else {
        sourcedata = bpetfc;
      }
      break
    //中证综指
    case '7':
      if (base.value === '1') {
        sourcedata = szzz;
      } else {
        sourcedata = szzzc;
      }
      break
    //恒生指数
    case '8':
      if (base.value === '1') {
        sourcedata = hsetf;
      } else {
        sourcedata = hsetfc;
      }
      break
    //科创创业
    case '9':
      if (base.value === '1') {
        sourcedata = kccy;
      } else {
        sourcedata = kccyc;
      }
      break
    //纳指
    case '10':
      if (base.value === '1') {
        sourcedata = nzetf;
      } else {
        sourcedata = nzetfc;
      }
      break
    default:
      sourcedata = hszs;
      break;
  }
  const sourceArr = []
  for (const i in sourcedata) {
    sourceArr.push(sourcedata[i])
  }
  resArr.value = sourceArr
  if (Number(openchg.value) < -3) {
    openchgRes.value = sourcedata['fw:<-0.03']
  } else if (Number(openchg.value) >= 3) {
    openchgRes.value = sourcedata['fw:>=0.03']
  } else {
    for (let i = -30; i <= 30; i += 1) {
      const i3 = (i / 1000).toFixed(3)
      const i2 = ((i + 1) / 1000).toFixed(3)
      const i4 = Number((i / 10).toFixed(2))
      const i5 = Number(((i + 1) / 10).toFixed(2))
      const k = 'fw:' + i3 + '~' + i2
      if (Number(openchg.value) >= i4 && Number(openchg.value) < i5) {
        openchgRes.value = sourcedata[k]
      }
    }
  }
}

selectEtf()

</script>

<template>
  <main>
    <div>
      <el-radio-group v-model="base" class="ml-4" @change="selectEtf">
        <el-radio value="1" size="large">开盘价</el-radio>
        <el-radio value="2" size="large">收盘价</el-radio>
      </el-radio-group>
    </div>
    <el-select v-model="curEtf" placeholder="Select" style="width: 240px" @change="selectEtf">
      <el-option v-for="item in selectOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <el-input v-model="openchg" style="width:240px;margin-left:20px" placeholder="涨跌" @input="selectEtf" />
    <h4  style="margin-top:20px">{{ openchgRes }}</h4>
    <div>------------------------------------------------------------------------------------</div>
    <div>全景数据:</div>
    <ul v-if="resArr.length">
      <li v-for="item of resArr">{{ item }}</li>
    </ul>
  </main>
</template>