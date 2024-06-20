import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import { createConnection } from 'mysql';

const request = axios.create({
    baseURL: 'https://stock.xueqiu.com',
    timeout: 1000, // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    headers: { 'Cookie': 'cookiesu=871710328061368; device_id=3cfa4e79d8759c51741fe541fc369fc5; s=ay12lp8qys; bid=74a8f782be3a6d36dae1ffd2d17920e5_lvex645z; remember=1; xq_is_login=1; u=4822941979; xq_a_token=575535595eadbd421d5a2f5bafc24fac50ad7b6b; xqat=575535595eadbd421d5a2f5bafc24fac50ad7b6b; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjQ4MjI5NDE5NzksImlzcyI6InVjIiwiZXhwIjoxNzIxMjM2NTEyLCJjdG0iOjE3MTg2NDQ1MTI0OTcsImNpZCI6ImQ5ZDBuNEFadXAifQ.IUjBYkH6irFSf6g59g_PQMc1ywfYNovjKeyfRRa2vhTrIW1QAd5VC7XZe4-mQ4kzW8YmCtU3Wjl9GQZdtFIXZVjxnL5rLbgdKHS_SdeN3IN6ptAGT1iQ2DOSSNSnolCTV-YoW5gS5HJHo_57ToQIqM9bu8H6vrgpAFm7UCRB_NykSz5UnNococIaTFiSOWEkQ16U29VyK0ztLomYx-FmBSLDRUDc3GfEQaFozBJGR6c2mFHBsOHLbrK_dVJfrT6tZdn8re2yu8UO1kRA9G4gTDyBSAgPxwxZqhE6KdxtSSPBID-uUuI4sf3MKbyyZmUJWWD-IQ6LJYnRTf_qMnCliQ; xq_r_token=8a58f524ebd7d1c43fba527db485c30321202b4d; Hm_lvt_1db88642e346389874251b5a1eded6e3=1717605737,1718185406,1718296603,1718644526; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1718644553' } // 自定义请求头
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

@Controller('hszs')
export class HszsController {
    @Get('query')
    async xinxi(@Query() q: any) {

        const res = await request.get(`/v5/stock/chart/kline.json?symbol=SH510760&begin=1718898366000&period=day&type=before&count=-1000&indicator=kline`)
        const data = res?.data?.data
        return JSON.stringify(data)
        const item = data?.item || []
        item.forEach(i => {
            const date = formattedDate(i[0])
            connection.query(`insert into szzz (date,open,high,low,close,chg) values ('${date}','${i[2]}','${i[3]}','${i[4]}','${i[5]}','${i[6]}')`, (err, results, fields) => {
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
        connection.query(`select * from szzz where 1 limit 1000`, (err, res, fields) => {

            const rres = []
            let allshouyi = 0
            const fanwei = {
                a0: 0,//>0.025
                a1: 0,//>0.02
                a2: 0,//>0.015 <=0.02
                a3: 0,//>0.01 <=0.015
                a4: 0,//>0.005 <=0.01
                a5: 0,//>0 <=0.005
                a6: 0,//>-0.005 <=0
                a7: 0,//>-0.01 <=0-0.005
                a8: 0,//>-0.015 <=-0.01
                a9: 0,//>-0.02 <=-0.015
                a10: 0,//<=-0.02
                b0: 0,//>0.025
                b1: 0,//>0.02
                b2: 0,//>0.015 <=0.02
                b3: 0,//>0.01 <=0.015
                b4: 0,//>0.005 <=0.01
                b5: 0,//>0 <=0.005
                b6: 0,//>-0.005 <=0
                b7: 0,//>-0.01 <=0-0.005
                b8: 0,//>-0.015 <=-0.01
                b9: 0,//>-0.02 <=-0.015
                b10: 0,//<=-0.02
            }
            const fwsy = {
                s1: 0,
                s2: 0,
                s3: 0,
                s4: 0,
                s5: 0,
                s6: 0,
                s7: 0,
                s8: 0,
                s9: 0,
                s10: 0,
                l1: 0,
                l2: 0,
                l3: 0,
                l4: 0,
                l5: 0,
                l6: 0,
                l7: 0,
                l8: 0,
                l9: 0,
                l10: 0,
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
                shouyikedu: q.shouyikedu ? Number(q.shouyikedu) : 50//收益刻度
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
                // if (high != close) {
                //     return
                //     sbt++
                // }
                //hs300
                // if (!((openchg > 0.01 && openchg < 0.015) || openchg < -0.0034)) {
                //     //开盘价在当前范围不购买首次
                //     return
                // }
                //xinxi
                // if (!((openchg > 0 && openchg < 0.005) || openchg < -0.01 || (openchg > 0.012 && openchg < 0.02) || (openchg > 0.021 && openchg < 0.022))) {
                //     //开盘价在当前范围不购买首次
                //     return
                // }
                //zz1000
                // if ((openchg >= -0.02 && openchg <= -0.01) || openchg >= 0.15 || (openchg <= 0.005 && openchg >= -0.0028)) {
                //     //开盘价在当前范围不购买首次
                //     return
                // }
                //zz500
                // if (!(openchg < -0.0034 || (openchg > 0.005 && openchg <= 0.01))) {
                //     //开盘价在当前范围不购买首次
                //     return
                // }
                //标普etf
                // if (!((openchg > -0.02 && openchg <= -0.015) || (openchg > 0.004 && openchg <= 0.007) || (openchg > -0.005 && openchg < -0.0022))) {
                //     //开盘价在当前范围不购买首次
                //     return
                // }
                //中证红利
                // if (!(openchg <= 0.005)) {
                //     //开盘价在当前范围不购买首次
                //     return
                // }

                let fys = Number((open + (base * params.fys)).toFixed(4))//首次购买盈利点位,首盈点
                let s = close * fbn
                let ab = open * fbn

                let hlf = nextOpen > nextClose ? 1 : 0//1先高后低,0先低后高
                //---------------------------t+0
                // if (hlf) {
                //     if (high >= fys) {
                //         zytimes += 1
                //         s = fys * fbn
                //     } else if (low <= zs) {
                //         s = zs * fbn
                //         zstimes += 1
                //     } else {
                //         s = close * fbn
                //     }
                // } else {
                //     if (low <= zs) {
                //         s = zs * fbn
                //         zstimes += 1
                //     } else if (high >= fys) {
                //         zytimes += 1
                //         s = fys * fbn
                //     } else {
                //         s = close * fbn
                //     }
                // }
                //---------------------------t+1
                if (hlf) {
                    if (nextOpen <= zs) {
                        s = nextOpen * fbn
                        zstimes += 1
                    } else if (nextOpen > fys) {
                        zytimes += 1
                        s = nextOpen * fbn
                    } else if (nextHigh >= fys) {
                        zytimes += 1
                        s = fys * fbn
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
                console.log(r.date, shouyi)
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
                        fwsy.s1 += shouyi
                    } else {
                        fanwei.b1 += 1
                        fwsy.l1 += shouyi
                    }
                } else if (openchg > 0.015 && openchg <= 0.02) {
                    if (shouyi >= 0) {
                        fanwei.a2 += 1
                        fwsy.s2 += shouyi
                    } else {
                        fanwei.b2 += 1
                        fwsy.l2 += shouyi
                    }
                } else if (openchg > 0.01 && openchg <= 0.015) {
                    if (shouyi >= 0) {
                        fanwei.a3 += 1
                        fwsy.s3 += shouyi
                    } else {
                        fanwei.b3 += 1
                        fwsy.l3 += shouyi
                    }
                } else if (openchg > 0.005 && openchg <= 0.01) {
                    if (shouyi >= 0) {
                        fanwei.a4 += 1
                        fwsy.s4 += shouyi
                    } else {
                        fanwei.b4 += 1
                        fwsy.l4 += shouyi
                    }
                } else if (openchg > 0 && openchg <= 0.005) {
                    if (shouyi >= 0) {
                        fanwei.a5 += 1
                        fwsy.s5 += shouyi
                    } else {
                        fanwei.b5 += 1
                        fwsy.l5 += shouyi
                    }
                } else if (openchg > -0.005 && openchg <= 0) {
                    if (shouyi >= 0) {
                        fanwei.a6 += 1
                        fwsy.s6 += shouyi
                    } else {
                        fanwei.b6 += 1
                        fwsy.l6 += shouyi
                    }
                } else if (openchg > -0.01 && openchg <= -0.005) {
                    if (shouyi >= 0) {
                        fanwei.a7 += 1
                        fwsy.s7 += shouyi
                    } else {
                        fanwei.b7 += 1
                        fwsy.l7 += shouyi
                    }
                } else if (openchg > -0.015 && openchg <= -0.01) {
                    if (shouyi >= 0) {
                        fanwei.a8 += 1
                        fwsy.s8 += shouyi
                    } else {
                        fanwei.b8 += 1
                        fwsy.l8 += shouyi
                    }
                } else if (openchg > -0.02 && openchg <= -0.015) {
                    if (shouyi >= 0) {
                        fanwei.a9 += 1
                        fwsy.s9 += shouyi
                    } else {
                        fanwei.b9 += 1
                        fwsy.l9 += shouyi
                    }
                } else if (openchg <= -0.02) {
                    if (shouyi >= 0) {
                        fanwei.a10 += 1
                        fwsy.s10 += shouyi
                    } else {
                        fanwei.b10 += 1
                        fwsy.l10 += shouyi
                    }
                }

                allshouyi += shouyi
            })
            ares = `
            大于${params.upbuypass}或者小于${params.upbuylimit}不购买  </br>
            小于${params.unbuyup}而且大于${params.unbuydown}不购买     </br>
            a0:>test:盈利次数:${fanwei.a0 + fanwei.b0},盈利概率:${fanwei.a0 / (fanwei.a0 + fanwei.b0)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a1:>0.02:盈利次数:${fanwei.a1 + fanwei.b1},盈利概率:${fanwei.a1 / (fanwei.a1 + fanwei.b1)}</br>
                    平均盈利:${fwsy.s1 / fanwei.a1},平均损失:${fwsy.l1 / fanwei.b1},数学期望:${(((fanwei.a1 / (fanwei.a1 + fanwei.b1)) * (fwsy.s1 / fanwei.a1)) + ((fanwei.b1 / (fanwei.a1 + fanwei.b1)) * (fwsy.l1 / fanwei.b1))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a2:>0.015 <=0.02:次数:${fanwei.a2 + fanwei.b2},盈利概率:${fanwei.a2 / (fanwei.a2 + fanwei.b2)}</br>
                    平均盈利:${fwsy.s2 / fanwei.a2},平均损失:${fwsy.l2 / fanwei.b2},数学期望:${(((fanwei.a2 / (fanwei.a2 + fanwei.b2)) * (fwsy.s2 / fanwei.a2)) + ((fanwei.b2 / (fanwei.a2 + fanwei.b2)) * (fwsy.l2 / fanwei.b2))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a3:>0.01 <=0.015:次数:${fanwei.a3 + fanwei.b3},盈利概率:${fanwei.a3 / (fanwei.a3 + fanwei.b3)}</br>
                    平均盈利:${fwsy.s3 / fanwei.a3},平均损失:${fwsy.l3 / fanwei.b3},数学期望:${(((fanwei.a3 / (fanwei.a3 + fanwei.b3)) * (fwsy.s3 / fanwei.a3)) + ((fanwei.b3 / (fanwei.a3 + fanwei.b3)) * (fwsy.l3 / fanwei.b3))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a4:>0.005 <=0.01:次数:${fanwei.a4 + fanwei.b4},盈利概率:${fanwei.a4 / (fanwei.a4 + fanwei.b4)}</br>
                    平均盈利:${fwsy.s4 / fanwei.a4},平均损失:${fwsy.l4 / fanwei.b4},数学期望:${(((fanwei.a4 / (fanwei.a4 + fanwei.b4)) * (fwsy.s4 / fanwei.a4)) + ((fanwei.b4 / (fanwei.a4 + fanwei.b4)) * (fwsy.l4 / fanwei.b4))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a5:>0 <=0.005:次数:${fanwei.a5 + fanwei.b5},盈利概率:${fanwei.a5 / (fanwei.a5 + fanwei.b5)}</br>
                    平均盈利:${fwsy.s5 / fanwei.a5},平均损失:${fwsy.l5 / fanwei.b5},数学期望:${(((fanwei.a5 / (fanwei.a5 + fanwei.b5)) * (fwsy.s5 / fanwei.a5)) + ((fanwei.b5 / (fanwei.a5 + fanwei.b5)) * (fwsy.l5 / fanwei.b5))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a6:>-0.005 <=0:次数:${fanwei.a6 + fanwei.b6},盈利概率:${fanwei.a6 / (fanwei.a6 + fanwei.b6)}</br>
                    平均盈利:${fwsy.s6 / fanwei.a6},平均损失:${fwsy.l6 / fanwei.b6},数学期望:${(((fanwei.a6 / (fanwei.a6 + fanwei.b6)) * (fwsy.s6 / fanwei.a6)) + ((fanwei.b6 / (fanwei.a6 + fanwei.b6)) * (fwsy.l6 / fanwei.b6))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a7:>-0.01 <=-0.005:次数:${fanwei.a7 + fanwei.b7},盈利概率:${fanwei.a7 / (fanwei.a7 + fanwei.b7)}</br>
                    平均盈利:${fwsy.s7 / fanwei.a7},平均损失:${fwsy.l7 / fanwei.b7},数学期望:${(((fanwei.a7 / (fanwei.a7 + fanwei.b7)) * (fwsy.s7 / fanwei.a7)) + ((fanwei.b7 / (fanwei.a7 + fanwei.b7)) * (fwsy.l7 / fanwei.b7))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a8:>-0.015 <=-0.01:次数:${fanwei.a8 + fanwei.b8},盈利概率:${fanwei.a8 / (fanwei.a8 + fanwei.b8)}</br>
                    平均盈利:${fwsy.s8 / fanwei.a8},平均损失:${fwsy.l8 / fanwei.b8},数学期望:${(((fanwei.a8 / (fanwei.a8 + fanwei.b8)) * (fwsy.s8 / fanwei.a8)) + ((fanwei.b8 / (fanwei.a8 + fanwei.b8)) * (fwsy.l8 / fanwei.b8))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a9:>-0.02 <=-0.015:次数:${fanwei.a9 + fanwei.b9},盈利概率:${fanwei.a9 / (fanwei.a9 + fanwei.b9)}</br>
                    平均盈利:${fwsy.s9 / fanwei.a9},平均损失:${fwsy.l9 / fanwei.b9},数学期望:${(((fanwei.a9 / (fanwei.a9 + fanwei.b9)) * (fwsy.s9 / fanwei.a9)) + ((fanwei.b9 / (fanwei.a9 + fanwei.b9)) * (fwsy.l9 / fanwei.b9))).toFixed(2)}</br>
            ---------------------------------------------------------------------------------------------------<br/>
            a10:<=-0.02:次数:${fanwei.a10 + fanwei.b10},盈利概率:${fanwei.a10 / (fanwei.a10 + fanwei.b10)}</br>
                    平均盈利:${fwsy.s10 / fanwei.a10},平均损失:${fwsy.l10 / fanwei.b10},数学期望:${(((fanwei.a10 / (fanwei.a10 + fanwei.b10)) * (fwsy.s10 / fanwei.a10)) + ((fanwei.b10 / (fanwei.a10 + fanwei.b10)) * (fwsy.l10 / fanwei.b10))).toFixed(2)}</br>
            总次数:${alltimes}</br>
            总收益:${allshouyi}</br>
            平收高次数:${sbt}</br>
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
            //localhost:3000/hszs/sx?fys=0.039&zs=0.0036&upbuypass=0.01&upbuylimit=-0.02&unbuyup=0.01&unbuydown=-0.0038&highup=0.002&highdown=-0.01&hfys=0.032&hzs=0.0012
        })
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = ares;
                resolve(result);
            }, 50);
        });

    }
}
