import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import { createConnection } from 'mysql';

const request = axios.create({
    baseURL: 'https://stock.xueqiu.com',
    timeout: 1000, // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    headers: { 'Cookie': 'cookiesu=871710328061368; device_id=3cfa4e79d8759c51741fe541fc369fc5; s=ay12lp8qys; bid=74a8f782be3a6d36dae1ffd2d17920e5_lvex645z; remember=1; xq_a_token=018770572dfbc838f189af88db074018a73ae062; xqat=018770572dfbc838f189af88db074018a73ae062; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjQ4MjI5NDE5NzksImlzcyI6InVjIiwiZXhwIjoxNzE5Njc2NDk0LCJjdG0iOjE3MTcwODQ0OTQ1NjcsImNpZCI6ImQ5ZDBuNEFadXAifQ.dWeCUQLofyMj_bZnMqqxXLDBY3pBpVbN3WHxz1FOsVkqcxm5R5v-kC78CaI3zfDclGCgG6u7C24_7tnhh8ZcGPesyOlXeCnc3HqCTii8iOJLw4BqxqyhxoH_X6BcPyajau3AMBJeOFZU32xnoGn8wqxe5VjAywEqRhJtp6k03V6Chjwzp-sq4xw949k9OJMNjPQTz27uZR3t7IT29HiPrA8Z5J2yrve3Zut-X3rCLNhw5fWL_SXf10tI67MblLIdL7bmohPYUFOZ55_2bDPRBkyu2Ivq7WxMWvZXQc6Gbypwis5lsIAxMPe3OVZxrfO6Cfrl_v8jd8tXnkHJnrVfNw; xq_r_token=a41149bdc96d1665d1344b82455e6cf7cbd5a5c0; xq_is_login=1; u=4822941979; Hm_lvt_1db88642e346389874251b5a1eded6e3=1717084059,1717584082,1717605737,1718185406; is_overseas=0; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1718185912' } // 自定义请求头
})


// 创建数据库连接
const connection = createConnection({
    host: 'localhost', // 数据库服务器地址
    user: 'root', // 数据库用户名
    password: 'root', // 数据库密码
    database: 'stock' // 要连接的数据库名
});

// 连接数据库
connection.connect(err => {
    if (err) {
        return console.error('error connecting: ' + err.stack);
    }

    console.log('connected as id ' + connection.threadId);
});

@Controller('zz1000')
export class Zz1000Controller {
    @Get('query')
    async xinxi(@Query() q: any) {

        const res = await request.get(`/v5/stock/chart/kline.json?symbol=SH512100&begin=1718272525633&period=day&type=before&count=-1000&indicator=kline`)
        const data = res?.data?.data
        return JSON.stringify(data)
        const item = data?.item || []
        item.forEach(i => {
            const date = formattedDate(i[0])
            connection.query(`insert into zz1000 (date,open,high,low,close,chg) values ('${date}','${i[2]}','${i[3]}','${i[4]}','${i[5]}','${i[6]}')`, (err, results, fields) => {
                if (err) throw err;
                // `results` 是查询结果
                // console.log(results);
            });
        });

        function formattedDate(d) {
            const date = new Date(d);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dd = `${year}-${month}-${day}`;
            return dd
        }


    }
    @Get('sx')
    async sx(@Query() q: any) {

        let ares = ''
        connection.query(`select * from zz1000 where 1 limit 1000`, (err, res, fields) => {

            const rres = []
            let allshouyi = 0
            const fanwei = {
                a0: 0,//>0.025
                a1: 0,//>0.02
                a2: 0,//>0.01 <=0.02
                a3: 0,//>0 <=0.01
                a4: 0,//>-0.01 <=0
                a5: 0,//>-0.02 <=-0.01
                a6: 0,//<-0.02
                b0: 0,//>0.025
                b1: 0,//>0.02
                b2: 0,//>0.01 <=0.02
                b3: 0,//>0 <=0.01
                b4: 0,//>-0.01 <=0
                b5: 0,//>-0.02 <=-0.01
                b6: 0,//<-0.02

            }
            let sbt = 0
            let times = 0
            let win = 0
            let loss = 0
            let losssome = 0
            let winsome = 0
            let zstimes = 0
            let zytimes = 0
            let alltimes = 0
            let alllose = 0
            let allwin = 0

            const params = {
                fys: q.fys ? Number(q.fys) : 0.03,//首购止盈
                zs: q.zs ? Number(q.zs) : 0.005,//首购止损
                upbuypass: q.upbuypass ? Number(q.upbuypass) : 0.01,//超过此不购买
                upbuylimit: q.upbuylimit ? Number(q.upbuylimit) : -0.001,//低于此不购买
                unbuyup: q.unbuyup ? Number(q.unbuyup) : 0.001,//不购买范围上
                unbuydown: q.unbuydown ? Number(q.unbuydown) : -0.02,//不购买范围下
                highup: q.highup ? Number(q.highup) : 0.002,//高开下限
                highdown: q.highdown ? Number(q.highdown) : 0,//低开上限
                hfys: q.hfys ? Number(q.hfys) : 0.03,//高开止盈
                hzs: q.hzs ? Number(q.hzs) : 0.01,//高开止损
                shouyikedu: q.shouyikedu ? Number(q.shouyikedu) : 100//收益刻度
            }

            res.forEach((r, i) => {
                if (r.date < '2022-06-12') return
                if (i == 0 || i == res.length - 1) return
                alltimes += 1
                const open = Number(r.open)
                const nextOpen = Number(res[i + 1].open)
                const close = Number(r.close)
                const nextClose = Number(res[i + 1].close)
                const low = Number(r.low)
                const nextLow = Number(res[i + 1].low)
                const high = Number(r.high)
                const nextHigh = Number(res[i + 1].high)
                const base = Number(res[i - 1].close)
                let fbn = 2000 //首次购买数量
                let zs = Number((open - (base * params.zs)).toFixed(4))
                const openchg = Number(((open - base) / base).toFixed(6))
                if (openchg <= params.unbuyup && openchg > params.unbuydown) {
                    //开盘价在当前范围不购买首次
                    return
                }
                if (openchg < params.upbuylimit || openchg > params.upbuypass) {
                    //开盘价在当前范围不购买首次
                    return
                }
                let fys = Number((open + (base * params.fys)).toFixed(4))//首次购买盈利点位,首盈点
                if (openchg > params.highup || openchg < params.highdown) {//高开的话拉大二次购买范围,缩小止盈

                    fys = Number((open + (base * params.hfys)).toFixed(4))//首次购买盈利点位,首盈点
                    zs = Number((open - (base * params.hzs)).toFixed(4))
                }
                let s = close * fbn
                let ab = open * fbn

                let hlf = nextOpen > nextClose ? 1 : 0//1先高后低,0先低后高
                if (hlf) {
                    if (nextOpen <= zs) {
                        s = nextOpen * fbn
                        zstimes += 1
                    } else if (nextOpen > fys) {
                        s = nextOpen * fbn
                        zytimes += 1
                    } else if (nextHigh >= fys) {
                        s = fys * fbn
                        zytimes += 1
                    } else if (nextLow <= zs) {
                        s = zs * fbn
                        zstimes += 1
                    } else {
                        s = nextClose * fbn
                    }
                } else {
                    if (nextOpen <= zs) {
                        s = nextOpen * fbn
                    } else if (nextOpen >= fys) {
                        zytimes += 1
                        s = nextOpen * fbn
                    } else if (nextLow <= zs) {
                        s = zs * fbn
                        zstimes += 1
                    } else if (nextHigh >= fys) {
                        zytimes += 1
                        s = fys * fbn
                    } else {
                        s = nextClose * fbn
                    }
                }
                times += 1
                const shouyi = s - ab
                if (shouyi > 0) {
                    allwin += shouyi
                    win += 1
                } else {
                    alllose += shouyi
                    loss += 1
                }
                if (shouyi < -params.shouyikedu) {
                    losssome += 1
                }
                if (shouyi > params.shouyikedu) {
                    winsome += 1
                    // console.log(r.date, shouyi)
                }
                if (openchg < -0.025) {
                    if (shouyi >= 0) {
                        fanwei.a0 += 1
                    } else {
                        fanwei.b0 += 1
                    }
                }
                if (openchg > 0.02) {
                    if (shouyi >= 0) {
                        fanwei.a1 += 1
                    } else {
                        fanwei.b1 += 1
                    }
                } else if (openchg <= 0.02 && openchg > 0.01) {
                    if (shouyi >= 0) {
                        fanwei.a2 += 1
                    } else {
                        fanwei.b2 += 1
                    }
                } else if (openchg <= 0.01 && openchg > 0) {
                    if (shouyi >= 0) {
                        fanwei.a3 += 1
                    } else {
                        fanwei.b3 += 1
                    }
                } else if (openchg <= 0 && openchg > -0.01) {
                    if (shouyi >= 0) {
                        fanwei.a4 += 1
                    } else {
                        fanwei.b4 += 1
                    }
                } else if (openchg <= -0.01 && openchg > -0.02) {
                    if (shouyi >= 0) {
                        fanwei.a5 += 1
                    } else {
                        fanwei.b5 += 1
                    }
                } else if (openchg <= -0.02) {
                    if (shouyi >= 0) {
                        fanwei.a6 += 1
                    } else {
                        fanwei.b6 += 1
                    }
                }

                allshouyi += shouyi
            })
            ares = `
            大于${params.upbuypass}或者小于${params.upbuylimit}不购买  </br>
            小于${params.unbuyup}而且大于${params.unbuydown}不购买     </br>
            a0:>test:次数:${fanwei.a0 + fanwei.b0},概率:${fanwei.a0 / (fanwei.a0 + fanwei.b0)}</br>
            a1:>0.02:次数:${fanwei.a1 + fanwei.b1},概率:${fanwei.a1 / (fanwei.a1 + fanwei.b1)}</br>
            a2:>0.01 <=0.02:次数:${fanwei.a2 + fanwei.b2},概率:${fanwei.a2 / (fanwei.a2 + fanwei.b2)}</br>
            a3:>0 <=0.01:次数:${fanwei.a3 + fanwei.b3},概率:${fanwei.a3 / (fanwei.a3 + fanwei.b3)}</br>
            a4:>-0.01 <=0:次数:${fanwei.a4 + fanwei.b4},概率:${fanwei.a4 / (fanwei.a4 + fanwei.b4)}</br>
            a5:>-0.02 <=-0.01:次数:${fanwei.a5 + fanwei.b5},概率:${fanwei.a5 / (fanwei.a5 + fanwei.b5)}</br>
            a6:<-0.02:次数:${fanwei.a6 + fanwei.b6},概率:${fanwei.a6 / (fanwei.a6 + fanwei.b6)}</br>
            总次数:${alltimes}</br>
            总收益:${allshouyi}</br>
            总购买次数:${times}</br>
            盈利胜率:${((win / (win + loss)) * 100).toFixed(2) + '%'}</br>
            止盈次数:${zytimes}</br>
            止损次数:${zstimes}</br>
            数学期望:${((win / (win + loss)) * (allwin / win)) + ((loss / (win + loss)) * (alllose / loss))}</br>
            平均每次盈利:${(allwin / win).toFixed(1)}</br>
            平均每次失败后损失:${(alllose / loss).toFixed(1)}</br>
            盈利大于${params.shouyikedu}次数:${winsome}</br>
            损失大于${params.shouyikedu}次数:${losssome}</br>
            参数:止盈:${params.fys * 100}%,止损:${params.zs * 100}%,开盘不购买范围:小于${params.unbuyup * 100}%且大于${params.unbuydown * 100}%或者大于${params.upbuypass * 100}%或者小于${params.upbuylimit * 100}%,高低开范围:大于${params.highup * 100}%或者小于${params.highdown * 100}%,高低开止盈:${params.hfys * 100}%,高低开止损:${params.hzs * 100}%
            `
            //localhost:3000/zz1000/sx?fys=0.04&zs=0.02&upbuypass=0.015&upbuylimit=-0.02&unbuyup=-0.02&unbuydown=-0.02&highup=0.002&highdown=0&hfys=0.03&hzs=0.01
        })
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = ares;
                resolve(result);
            }, 50);
        });

    }
}
