<script setup>
import { ref } from 'vue'
import TheWelcome from '../components/TheWelcome.vue'
import xinxi from '../stockdata/xinxi'
import { useRoute } from 'vue-router'
const route = useRoute()
const t = route.query.t
const a = route.query.p
let temp = ''
let sourcedata = {}
let sourceArr = []
switch (t) {
  //标普信息科技
  case 'xxkj':
    sourcedata = xinxi;
    break
  //沪深300
  case 'hs300':
    sourcedata = hszs;
    break
  //中证1000
  case 'zz1000':
    sourcedata = zz1000;
    break
  //中证500
  case 'zz500':
    sourcedata = zz500;
    break
  //中证红利
  case 'zzhl':
    sourcedata = zzhl;
    break
  //标普etf
  case 'bpetf':
    sourcedata = bpetf;
    break
  //中证综指
  case 'zzzz':
    sourcedata = szzz;
    break
}
for (const i in sourcedata) {
  sourceArr.push(sourcedata[i])
}

const p = Number((a / 100).toFixed(4))
if (p < -0.03) {
  temp = sourcedata['fw<-0.03'];

} else if (p >= 0.03) {
  temp = sourcedata['fw>=0.03'];
} else {
  for (let i = -0.03; i <= 0.03; i += 0.001) {
    const i2 = i + 0.001
    const k = 'fw:' + i.toFixed(3) + '~' + i2.toFixed(3)
    if (p >= i && p < i2) {
      temp = sourcedata[k];
    }
  }
}

const res = ref(temp)

const resArr = ref(sourceArr)
</script>

<template>
  <main>
    {{ res }}
    <div>全部数据:</div>
    <ul v-if="resArr.length">
      <li v-for="item of resArr">{{ item }}</li>
    </ul>
  </main>
</template>