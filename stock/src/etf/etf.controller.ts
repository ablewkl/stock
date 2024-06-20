import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import { createConnection } from 'mysql';

const request = axios.create({
    baseURL: 'https://stock.xueqiu.com',
    timeout: 1000, // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    headers: { 'Cookie': 'cookiesu=871710328061368; device_id=3cfa4e79d8759c51741fe541fc369fc5; s=ay12lp8qys; bid=74a8f782be3a6d36dae1ffd2d17920e5_lvex645z; remember=1; xq_a_token=018770572dfbc838f189af88db074018a73ae062; xqat=018770572dfbc838f189af88db074018a73ae062; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjQ4MjI5NDE5NzksImlzcyI6InVjIiwiZXhwIjoxNzE5Njc2NDk0LCJjdG0iOjE3MTcwODQ0OTQ1NjcsImNpZCI6ImQ5ZDBuNEFadXAifQ.dWeCUQLofyMj_bZnMqqxXLDBY3pBpVbN3WHxz1FOsVkqcxm5R5v-kC78CaI3zfDclGCgG6u7C24_7tnhh8ZcGPesyOlXeCnc3HqCTii8iOJLw4BqxqyhxoH_X6BcPyajau3AMBJeOFZU32xnoGn8wqxe5VjAywEqRhJtp6k03V6Chjwzp-sq4xw949k9OJMNjPQTz27uZR3t7IT29HiPrA8Z5J2yrve3Zut-X3rCLNhw5fWL_SXf10tI67MblLIdL7bmohPYUFOZ55_2bDPRBkyu2Ivq7WxMWvZXQc6Gbypwis5lsIAxMPe3OVZxrfO6Cfrl_v8jd8tXnkHJnrVfNw; xq_r_token=a41149bdc96d1665d1344b82455e6cf7cbd5a5c0; xq_is_login=1; u=4822941979; is_overseas=0; Hm_lvt_1db88642e346389874251b5a1eded6e3=1717084059,1717584082; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1717584120' } // 自定义请求头
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

@Controller('etf')
export class EtfController {
    @Get('query')
    async query(@Query() q: any) {

        const res = await request.get(`/v5/stock/chart/kline.json?symbol=${q.symbol}&begin=1714063607592&period=day&type=before&count=-850&indicator=kline`)
        const data = res?.data?.data
        const code = data.symbol.slice(2, 8)
        const item = data?.item || []
        item.forEach(i => {
            const date = formattedDate(i[0])
            connection.query(`insert into etf (code,open,high,low,close,chg,date) values ('${code}','${i[2]}','${i[3]}','${i[4]}','${i[5]}','${i[6]}','${date}')`, (err, results, fields) => {
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
    @Get('xinxi')
    async xinxi(@Query() q: any) {

        const res = await request.get(`/v5/stock/chart/kline.json?symbol=SZ161128&begin=1717670547259&period=day&type=before&count=-1000&indicator=kline`)
        const data = res?.data?.data
        // return JSON.stringify(data)
        // const item = data?.item || []
        // item.forEach(i => {
        //     const date = formattedDate(i[0])
        //     connection.query(`insert into xinxi (date,open,high,low,close,chg) values ('${date}','${i[2]}','${i[3]}','${i[4]}','${i[5]}','${i[6]}')`, (err, results, fields) => {
        //         if (err) throw err;
        //         // `results` 是查询结果
        //         // console.log(results);
        //     });
        // });

        // function formattedDate(d) {
        //     const date = new Date(d);
        //     const year = date.getFullYear();
        //     const month = String(date.getMonth() + 1).padStart(2, '0');
        //     const day = String(date.getDate()).padStart(2, '0');
        //     const dd = `${year}-${month}-${day}`;
        //     return dd
        // }


    }
    @Get('sx')
    async sx(@Query() q: any) {


        connection.query(`select * from xinxi where 1 limit 1000`, (err, res, fields) => {
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
            let testhlf = 0

            const params = {
                fys: 0.012,//首购止盈
                zs: 0.02,//首购止损
                unbuyup: 0,//不购买范围上
                unbuydown: -0.014,//不购买范围下
                highup: 0.01,//高开下限
                highdown: -0.023,//低开上限
                hfys: 0.047,//高开止盈
                hzs: 0.007,//高开止损
                shouyikedu: 50//收益刻度
            }

            res.forEach((r, i) => {
                if (i == 0) return
                const open = Number(r.open)
                const close = Number(r.close)
                const low = Number(r.low)
                const high = Number(r.high)
                const base = Number(res[i - 1].close)
                let fbn = 2000 //首次购买数量
                let sbn = 0 //第二次购买数量
                const openchg = Number(((open - base) / base).toFixed(6))
                if ((r.open > r.close && r.hlf == '1') || (r.open < r.close && r.hlf == '0')) {
                    testhlf += 1
                }
                if (openchg <= params.unbuyup && openchg > params.unbuydown) {
                    fbn = 0//开盘价在当前范围不购买首次
                    return
                }

                let sb = Number((open - (base * 0.012)).toFixed(4))//第二次购买点位
                let tb = Number((open - (base * 0.02)).toFixed(4))//第三次购买点位
                let zs = Number((open - (base * params.zs)).toFixed(4))//止损位置
                let fys = Number((open + (base * params.fys)).toFixed(4))//首次购买盈利点位,首盈点
                let sys = Number((open + (base * 0.021)).toFixed(4))//第二次购买盈利点位,二盈点
                if (openchg > params.highup || openchg < params.highdown) {//高开的话拉大二次购买范围,缩小止盈
                    // sb = Number((open - (base * 0.03)).toFixed(4))
                    zs = Number((open - (base * params.hzs)).toFixed(4))//首次购买盈利点位,首盈点
                    fys = Number((open + (base * params.hfys)).toFixed(4))//首次购买盈利点位,首盈点
                    // sys = Number((open + (base * 0.015)).toFixed(4))//第二次购买盈利点位,二盈点
                }
                //首次买在开盘价,不买0~-1.4%位置的价位,买入后目标止盈价2.5%,不止盈则收盘价卖出,
                //无论开盘价在任何范围,只要跌了1.2%买入,买入后止盈价为开盘价回升2.1%
                let s = close * fbn
                let ab = open * fbn
                let st = true//是否购买第二第三次

                if (r.hlf == '1') {//先高后低
                    if (high >= fys) {//如果最高点大于首盈点则止盈
                        st = false
                        s = fys * fbn
                    }
                    //止损
                    else if (zs >= low) {
                        s = zs * fbn
                    }
                    //无法止盈如果触发第二次购买则收盘价卖出
                    // else if (sb >= low && st) {
                    //     ab = ab + (sb * sbn)
                    //     s = close * (fbn + sbn)
                    //     sbt += 1
                    // }
                    //没有触发第二次购买则收盘价卖出
                    else {
                        s = close * fbn
                    }
                } else if (r.hlf == '0') {//先低后高
                    //触发第二次购买
                    // if (sb >= low && st) {
                    //     ab = ab + (sb * sbn)
                    //     s = close * (fbn + sbn)
                    //     //如果最高点大于二盈点则卖出
                    //     if (high > sys) {
                    //         s = sys * (fbn + sbn)
                    //     }
                    //     //否则收盘价卖出
                    //     else {
                    //         s = close * (fbn + sbn)
                    //     }
                    //     sbt += 1
                    // }
                    //止损
                    if (zs >= low) {
                        s = zs * fbn
                    }
                    //如果没有触发第二次购买则首盈点卖出
                    else if (high >= fys) {
                        s = fys * fbn

                    }
                    //高点没有达到首盈点则收盘价卖出
                    else {
                        s = close * fbn
                    }

                }

                // if (tb >= low && st) {
                //     ab = ab + (tb * 1000)
                //     s = close * 3000
                // }
                times += 1
                const shouyi = s - ab
                if (shouyi > 0) {
                    win += 1
                } else {
                    loss += 1
                }
                if (shouyi < -params.shouyikedu) {
                    losssome += 1
                    // console.log(r.date, shouyi)
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

            console.log('a0:>test', fanwei.a0 / (fanwei.a0 + fanwei.b0))
            console.log('a1:>0.02', fanwei.a1 / (fanwei.a1 + fanwei.b1))
            console.log('a2:>0.01 <=0.02', fanwei.a2 / (fanwei.a2 + fanwei.b2))
            console.log('a3:>0 <=0.01', fanwei.a3 / (fanwei.a3 + fanwei.b3))
            console.log('a4:>-0.01 <=0', fanwei.a4 / (fanwei.a4 + fanwei.b4))
            console.log('a5:>-0.02 <=-0.01', fanwei.a5 / (fanwei.a5 + fanwei.b5))
            console.log('a6:<-0.02', fanwei.a6 / (fanwei.a6 + fanwei.b6))
            console.log('第二次购买次数:', sbt)
            console.log('总收益:', allshouyi)
            console.log('总购买次数:', times)
            console.log('盈利胜率:', ((win / (win + loss)) * 100).toFixed(2) + '%')
            console.log('平均每次盈利:', (allshouyi / times).toFixed(1))
            console.log(`盈利大于${params.shouyikedu}次数:`, winsome)
            console.log(`损失大于${params.shouyikedu}次数:`, losssome)
            console.log('参数:', `止盈:${params.fys},止损:${params.zs},不购买范围:${params.unbuyup}~${params.unbuydown},高开范围:>${params.highup}或者<${params.highdown},高开止盈:${params.hfys},高开止损:${params.hzs},`)
            console.log('准确率:', testhlf / res.length)

        })



    }
    @Get('hl')
    async hl(@Query() q: any) {


        connection.query(`select * from xinxi where 1 limit 900,100`, (err, res, fields) => {
            res.forEach(async (row, i) => {
                const timestamp = Date.parse(row.date) + 10 * 3600 * 1000
                const r = await request.get(`/v5/stock/chart/kline.json?symbol=SZ161128&begin=${timestamp}&period=1m&type=before&count=-240&indicator=kline`)
                const item = r?.data?.data?.item || []
                console.log(r?.data?.data)
                let hightime = 0
                let lowtime = 0
                item.forEach((row2, i2) => {
                    console.log(row2[3], row2[4], row.high, row.low)
                    if (row2[3] == row.high && hightime == 0) {

                        hightime = row2[0]
                    }
                    if (row2[4] == row.low && lowtime == 0) {
                        lowtime = row2[0]
                    }
                })
                if (hightime == 0 && lowtime == 0) {
                    connection.query(`update xinxi set hlf ='none' where id = ${row.id}`, (err, res, fields) => { })
                } else if (hightime > lowtime) {
                    connection.query(`update xinxi set hlf ='low' where id = ${row.id}`, (err, res, fields) => { })
                } else {
                    connection.query(`update xinxi set hlf ='high' where id = ${row.id}`, (err, res, fields) => { })
                }
            })


        })


    }
}
