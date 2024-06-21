import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import { createConnection } from 'mysql';

const request = axios.create({
    baseURL: 'https://stock.xueqiu.com',
    timeout: 1000, // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    headers: { 'Cookie': 'cookiesu=871710328061368; device_id=3cfa4e79d8759c51741fe541fc369fc5; s=ay12lp8qys; bid=74a8f782be3a6d36dae1ffd2d17920e5_lvex645z; remember=1; xq_is_login=1; u=4822941979; xq_a_token=575535595eadbd421d5a2f5bafc24fac50ad7b6b; xqat=575535595eadbd421d5a2f5bafc24fac50ad7b6b; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjQ4MjI5NDE5NzksImlzcyI6InVjIiwiZXhwIjoxNzIxMjM2NTEyLCJjdG0iOjE3MTg2NDQ1MTI0OTcsImNpZCI6ImQ5ZDBuNEFadXAifQ.IUjBYkH6irFSf6g59g_PQMc1ywfYNovjKeyfRRa2vhTrIW1QAd5VC7XZe4-mQ4kzW8YmCtU3Wjl9GQZdtFIXZVjxnL5rLbgdKHS_SdeN3IN6ptAGT1iQ2DOSSNSnolCTV-YoW5gS5HJHo_57ToQIqM9bu8H6vrgpAFm7UCRB_NykSz5UnNococIaTFiSOWEkQ16U29VyK0ztLomYx-FmBSLDRUDc3GfEQaFozBJGR6c2mFHBsOHLbrK_dVJfrT6tZdn8re2yu8UO1kRA9G4gTDyBSAgPxwxZqhE6KdxtSSPBID-uUuI4sf3MKbyyZmUJWWD-IQ6LJYnRTf_qMnCliQ; xq_r_token=8a58f524ebd7d1c43fba527db485c30321202b4d; Hm_lvt_1db88642e346389874251b5a1eded6e3=1718296603,1718644526,1718918151,1718952129; is_overseas=0; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1718953322' } // 自定义请求头
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
});



@Controller('t0')
export class T0Controller {

    @Get('test')
    async test() {

    }
    @Get('query')
    async xinxi(@Query() q: any) {

        const res = await request.get(`/v5/stock/chart/kline.json?symbol=SH513100&begin=1718898366000&period=day&type=before&count=-1000&indicator=kline`)
        const data = res?.data?.data
        // return JSON.stringify(data)
        const item = data?.item || []
        item.forEach(i => {
            const date = formattedDate(i[0])
            connection.query(`insert into nzetf (date,open,high,low,close,chg) values ('${date}','${i[2]}','${i[3]}','${i[4]}','${i[5]}','${i[6]}')`, (err, results, fields) => {
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
        //范围次数
        let fanwei = {
            'fw:<-0.03': 0,
            'fw:>=0.03': 0,
        }
        //范围盈利次数
        let fwyl = {
            'fw:<-0.03': 0,
            'fw:>=0.03': 0,
        }
        //范围亏损次数
        let fwks = {
            'fw:<-0.03': 0,
            'fw:>=0.03': 0,
        }
        //范围收益次数
        let fwsy = {
            'fw:<-0.03': 0,
            'fw:>=0.03': 0,
        }
        //范围总收益
        let fwayl = {
            'fw:<-0.03': 0,
            'fw:>=0.03': 0,
        }
        //范围总亏损
        let fwaks = {
            'fw:<-0.03': 0,
            'fw:>=0.03': 0,
        }

        //总结果对象
        let allres = {

        }
        function initdata() {
            //总结果对象
            allres = {

            }
            for (let i = -30; i < 30; i += 1) {
                const i3 = (i / 1000).toFixed(3)
                const i2 = ((i + 1) / 1000).toFixed(3)
                const k = 'fw:' + i3 + '~' + i2
                fanwei[k] = 0
                fwsy[k] = 0
                fwyl[k] = 0
                fwks[k] = 0
                fwayl[k] = 0
                fwaks[k] = 0
            }
        }

        function printRes(fanwei, fwyl) {
            let res = ''
            for (let i = -31; i <= 30; i += 1) {
                const i3 = (i / 1000).toFixed(3)
                const i2 = ((i + 1) / 1000).toFixed(3)
                const f1 = (i / 10).toFixed(2)
                const f2 = ((i + 1) / 10).toFixed(2)
                let k = ''
                let fwt = ''
                if (i == -31) {
                    k = 'fw:<-0.03'
                    fwt = '范围:<-3%'
                } else if (i == 30) {
                    k = 'fw:>=0.03'
                    fwt = '范围:>=3%'
                } else {
                    k = 'fw:' + i3 + '~' + i2
                    fwt = `范围:>=${f1}% ~ <${f2}%`
                }

                let sl = fwyl[k] && fwks[k] ? (fwyl[k] / fanwei[k] * 100).toFixed(2) : 0
                if (fwyl[k] > 0 && fwks[k] === 0) {
                    sl = 100
                }
                let red = ''
                let red2 = ''
                if (fwsy[k] > 0) {
                    red = `<d style='color:red;'>`
                    red2 = '</d>'
                }
                //数学期望
                let sxqw: number | string = (fwyl[k] / fanwei[k]) * (fwayl[k] / fanwei[k]) + (fwks[k] / fanwei[k]) * (fwaks[k] / fanwei[k])
                sxqw = sxqw ? sxqw.toFixed(2) : '无'
                let pjyl = fwayl[k] ? (fwayl[k] / fanwei[k]).toFixed(2) : '无'
                let pjks = fwaks[k] ? (fwaks[k] / fanwei[k]).toFixed(2) : '无'
                allres[k] = `${fwt}:----次数:${fanwei[k]};胜率:${sl}%;收益:${fwsy[k].toFixed(2)};平均盈利:${pjyl};平均亏损:${pjks};数学期望:${sxqw};`
                res += `${red}----------------------------------------<br/>
                范围:>=${fwt}:<br/>
                ----次数:${fanwei[k]};胜率:${sl}%;收益:${fwsy[k].toFixed(2)};平均盈利:${pjyl};平均亏损:${pjks};数学期望:${sxqw};<br/>
                ${red2}`
            }
            return res
        }


        function dealdata(openchg, shouyi) {
            if (openchg < -0.03) {
                fanwei['fw:<-0.03'] += 1
                shouyi > 0 ? fwyl['fw:<-0.03'] += 1 : fwks['fw:<-0.03'] += 1
                shouyi > 0 ? fwayl['fw:<-0.03'] += shouyi : fwaks['fw:<-0.03'] += shouyi
                fwsy['fw:<-0.03'] += shouyi
                return
            }
            if (openchg >= 0.03) {
                fanwei['fw:>=0.03'] += 1
                fwsy['fw:>=0.03'] += shouyi
                shouyi > 0 ? fwyl['fw:>=0.03'] += 1 : fwks['fw:>=0.03'] += 1
                shouyi > 0 ? fwayl['fw:>=0.03'] += shouyi : fwaks['fw:>=0.03'] += shouyi
                return
            }
            for (let i = -30; i < 30; i += 1) {
                const i3 = (i / 1000).toFixed(3)
                const i2 = ((i + 1) / 1000).toFixed(3)
                const i4 = Number((i / 1000).toFixed(4))
                const i5 = Number(((i + 1) / 1000).toFixed(4))
                const k = 'fw:' + i3 + '~' + i2
                if (openchg >= i4 && openchg < i5) {
                    fanwei[k] = fanwei[k] + 1
                    fwsy[k] += shouyi
                    shouyi > 0 ? fwyl[k] += 1 : fwks[k] += 1
                    shouyi > 0 ? fwayl[k] += shouyi : fwaks[k] += shouyi
                    return
                }
            }
        }

        initdata()

        const symbol = q.s || 'kccy'
        let ares = ''
        connection.query(`select * from ${symbol} where 1 limit 1000`, (err, res, fields) => {

            const rres = []
            let allshouyi = 0

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
                fys: q.fys ? Number(q.fys) : 1,//首购止盈
                zs: q.zs ? Number(q.zs) : 1,//首购止损
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
                if (r.date < '2021-06-12') return
                if (i == 0 || i == res.length - 1) return
                alltimes += 1
                const open = Number(r.open)
                const nextOpen = Number(res[i + 1].open)
                const nextHigh = Number(res[i + 1].high)
                const close = Number(r.close)
                const nextClose = Number(res[i + 1].close)
                const base = Number(res[i - 1].close)
                let fbn = 2000 //首次购买数量
                const openchg = Number(((open - base) / base).toFixed(6))
                // const openchg = Number(((close - base) / base).toFixed(6))

                let s = close * fbn
                let ab = open * fbn
                //---------------------------t+1直接收
                // if (nextOpen > Number((close + (close * 0.02)).toFixed(4))) {
                //     s = nextOpen * fbn
                // } else {
                //     s = nextClose * fbn
                // }
                if (nextOpen > open) {
                    s = nextOpen * fbn
                } else {
                    s = nextClose * fbn
                }
                times += 1
                const shouyi = s - ab
                // console.log(r.date, shouyi)
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
                allshouyi += shouyi
                dealdata(openchg, shouyi)
            })
            const printR = printRes(fanwei, fwyl)
            ares = `
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
            参数:止盈:${params.fys * 100}%,止损:${params.zs * 100}%<br/>
            ${printR}
            ${JSON.stringify(allres)}
            `
        })
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = ares;
                resolve(result);
            }, 50);
        });

    }
}
