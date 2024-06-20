import { Controller, Get, Param, Query } from '@nestjs/common';
import axios from 'axios';
import { createConnection } from 'mysql';

const request = axios.create({
    baseURL: 'https://stock.xueqiu.com',
    timeout: 1000, // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    headers: { 'Cookie': 'cookiesu=871710328061368; device_id=3cfa4e79d8759c51741fe541fc369fc5; s=ay12lp8qys; Hm_lvt_1db88642e346389874251b5a1eded6e3=1712917422,1713422655,1713512099,1713529401; remember=1; xq_a_token=d57e6b626fe4db0d032fb45f55cfeb66fab42a76; xqat=d57e6b626fe4db0d032fb45f55cfeb66fab42a76; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjQ4MjI5NDE5NzksImlzcyI6InVjIiwiZXhwIjoxNzE1NTA5NDI1LCJjdG0iOjE3MTM1MzI2MTExMDYsImNpZCI6ImQ5ZDBuNEFadXAifQ.mzzLL6X-AOI5gMhINRsjk0V02E0r2PAU3bdBi9PwNG-rfhQwHamgThwbXN2m91_NU7vlo3YiVWOTdyrU1Cc4dOmG4ouiOOeLNDVqWhcoSv-ZybBslQM05kSVXSX0fVZKy_GhKXSdbmhfT8EMMnKm9X8DLdItYje1_C-3ScNc8M7q8qF9yCKT_A3JdFlN6ezwXl0vAGPXhgkuJLtnQDRUu3fD37zDNNEn9_XFi4ugfVmZkNMLFRLw8lU5GiZQAoRcNyVTvLfeFqY6CqdNaD7UR8SCYEerxu3ue-lZK4kB7Ta67LY45_odtDQJpRdnSb6P9JjVuRyuIWJ0BkjZLPV_ew; xq_r_token=138e00ce77d15736fd8f38b663ceac83675da1ee; xq_is_login=1; u=4822941979; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1713547536' } // 自定义请求头
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
// connection.end(err => {
//     if (err) return console.log(err.message);

//     console.log('Closed the database connection.');
// });
@Controller('stock')
export class StockController {
    // @Get('insert')
    // async insert() {
    //     for (let index = 21; index <= 59; index++) {
    //         const res = await request.get(`/v5/stock/screener/quote/list.json?page=${index}&size=90&order=asc&order_by=symbol&market=CN&type=sh_sz`)
    //         const list = res?.data?.data?.list || []
    //         list.forEach(i => {
    //             const stock_code = i.symbol.slice(2, 8)
    //             if (`${stock_code[0]}${stock_code[1]}` != '00' && `${stock_code[0]}${stock_code[1]}` != '60') return
    //             connection.query(`insert into astock (stock_code) values ('${stock_code}')`, (err, results, fields) => {
    //                 if (err) throw err;
    //                 // `results` 是查询结果
    //                 // console.log(results);
    //             });
    //         });

    //     }
    // }

    @Get('query')
    async query(@Query() q: any) {
        connection.query(`select * from  astock limit ${(q.page - 1) * 100},100`, (err, res, fields) => {
            if (err) throw err;
            res.forEach(async (i: any) => {
                // if (i.day_kline) return
                let symbol = i.stock_code
                switch (`${i.stock_code[0]}${i.stock_code[1]}`) {
                    case '00':
                        symbol = 'SZ' + symbol
                        break;
                    case '60':
                        symbol = 'SH' + symbol
                        break;
                    default:
                        ;
                }
                // console.log(symbol)
                const res = await request.get(`/v5/stock/chart/kline.json?symbol=${symbol}&begin=1713629941105&period=day&type=before&count=-284&indicator=kline`)
                const list = res?.data?.data?.item || []
                const day_kline_arr = []
                list.forEach((c: Array<number>) => {
                    const d = {
                        'date': formattedDate(c[0]),
                        'open': c[2],
                        'hight': c[3],
                        'low': c[4],
                        'close': c[5],
                    }
                    day_kline_arr.push(d)
                })
                const day_kline = JSON.stringify(day_kline_arr)
                // console.log(day_kline);
                connection.query(`update astock set day_kline = '${day_kline}' where id = ${i.id}`, (err, results, fields) => {
                    if (err) throw err;
                    // `results` 是查询结果
                    // console.log(results);
                });

            })
            console.log('finish' + q.page)
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

    // @Get('ma')
    // async ma() {``
    //     connection.query(`select * from astock where 1`, (err, res, fields) => {
    //         if (err) throw err;
    //         // `results` 是查询结果
    //         res.forEach(r => {
    //             let temp_kline = []
    //             try {
    //                 temp_kline = JSON.parse(r.day_kline)
    //             } catch (e) {
    //                 temp_kline = []
    //             }
    //             temp_kline.forEach((v, i) => {
    //                 let row = { ...v }
    //                 //ma5 
    //                 if (i >= 5 - 1) {
    //                     const ma5 = countMa(temp_kline, i, 5)
    //                     row = { ...v, ma5 }
    //                 }
    //                 //ma10
    //                 if (i >= 10 - 1) {
    //                     const ma10 = countMa(temp_kline, i, 10)
    //                     row = { ...row, ma10 }
    //                 }
    //                 //ma20
    //                 if (i >= 20 - 1) {
    //                     const ma20 = countMa(temp_kline, i, 20)
    //                     row = { ...row, ma20 }
    //                 }
    //                 //ma60
    //                 if (i >= 60 - 1) {
    //                     const ma60 = countMa(temp_kline, i, 60)
    //                     row = { ...row, ma60 }
    //                 }
    //                 temp_kline[i] = row
    //             })
    //             const day_kline = JSON.stringify(temp_kline)
    //             connection.query(`update astock set day_kline = '${day_kline}' where id = '${r.id}' `, (err, res, fields) => {
    //                 if (err) throw err;
    //                 // `results` 是查询结果
    //             })
    //         })
    //     });

    //     function countMa(arr, startInx, num) {

    //         let price = 0
    //         for (let inx = startInx; inx > startInx - num; inx--) {
    //             price += arr[inx].close
    //         }
    //         return (price / num).toFixed(2)
    //     }
    // }

    @Get('limitup')
    async limitup(@Query() q: any) {
        console.log(`select * from astock where 1 limit ${(q.page - 1) * 1000},1000`)
        connection.query(`select * from astock where 1 limit ${(q.page - 1) * 1000},1000`, (err, res, fields) => {
            if (err) throw err;
            // `results` 是查询结果
            res.forEach(r => {
                let temp_kline = []
                try {
                    temp_kline = JSON.parse(r.day_kline)
                } catch (e) {
                    temp_kline = []
                }
                temp_kline.forEach((v, i) => {
                    if (i >= 20 && temp_kline[i + 7]) {
                        const lastday = temp_kline[i - 1]
                        //上一日涨停价
                        const lastdaylimitupprice = Number((lastday.close.toFixed(2) * 1.1).toFixed(2))
                        // console.log(lastdaylimitupprice, '---', v.close.toFixed(2))
                        const todayprice = Number((v.close.toFixed(2)))
                        if (lastdaylimitupprice == todayprice || lastdaylimitupprice == todayprice + 0.01 || lastdaylimitupprice == todayprice - 0.01) {
                            const before20ma = staticBefore20Ma(temp_kline, i)
                            const after7rise = staticAfter7rise(temp_kline, i)
                            connection.query(`insert into limitup (stock_code,riseprice,before20ma,after7rise,limitupdate) values ('${r.stock_code}','${v.close.toFixed(2)}','${before20ma}','${after7rise}','${v.date}')`, (err, res, fields) => {
                                if (err) throw err;
                                // `results` 是查询结果
                            })
                        }
                    }
                })
                // const day_kline = JSON.stringify(temp_kline)
                // connection.query(`update astock set day_kline = '${day_kline}' where id = '${r.id}' `, (err, res, fields) => {
                //     if (err) throw err;
                //     // `results` 是查询结果
                // })
                function staticBefore20Ma(arr, inx) {
                    const before20ma = []
                    for (let i2 = inx; i2 >= inx - 20; i2--) {
                        const row = {
                            date: arr[i2].date,
                            ma5: arr[i2].ma5,
                            ma10: arr[i2].ma10,
                            ma20: arr[i2].ma20,
                            ma60: arr[i2].ma60,
                        }
                        before20ma.push(row)
                    }
                    return JSON.stringify(before20ma)

                }
                function staticAfter7rise(arr, inx) {
                    const after7rise = []
                    for (let i = inx + 1; i <= inx + 7; i++) {
                        const rise = (Number(((arr[i].close - arr[inx].close) / arr[inx].close).toFixed(4)) * 100).toFixed(2)
                        const row = {
                            afterday: i - inx,
                            rise: rise
                        }
                        after7rise.push(row)
                    }
                    return JSON.stringify(after7rise)

                }

            })
        });
    }

}
