const https = require('https');
const parse = require('./stealNYT')

function getPastMondays(n) {
    let dates = [];
    let currentDate = new Date();
    let daysToLastMonday = (currentDate.getDay() + 6) % 7; // Get the days since last Monday

    // Set the date to last Monday
    currentDate.setDate(currentDate.getDate() - daysToLastMonday);

    for (let i = 0; i < n; i++) {
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1; // getMonth() returns 0-11
        let day = currentDate.getDate();

        // Format the date as YYYY-MM-DD
        let formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        dates.push(formattedDate);

        // Go to the previous Monday
        currentDate.setDate(currentDate.getDate() - 7);
    }

    return dates;
}

// Example usage
console.log(getPastMondays(15)); // Returns the last 5 Mondays


// function getPastDates(n) {
//     let dates = [];
//     let currentDate = new Date();

//     for (let i = 0; i < n; i++) {
//         let date = new Date(currentDate.getTime() - (i * 24 * 60 * 60 * 1000));
//         let formattedDate = date.toISOString().split('T')[0];
//         dates.push(formattedDate);
//     }

//     return dates;
// }


// async function fetchPuzzles(dates) {
//     const baseUrl = "https://www.nytimes.com/svc/crosswords/v6/puzzle/daily/";

//     const parsedPuzzles = []
//     for (const date of dates) {
//         const url = new URL(`${baseUrl}${date}.json`);
//         const options = {
//             hostname: url.hostname,
//             path: url.pathname + url.search,
//             headers: {
//                 "Cookie": "nyt-a=hqgI8x1BoiKrSPaw4xp-nH; _gcl_au=1.1.1313786748.1700259974; nyt-purr=cfshcfhssckfsdfhh; _cb=DPKuV-BPEzW9CNlLv4; nyt-b3-traceid=52daa7f72a0e4ebe96a7c79e12b3f194; iter_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiI2MTc3NmYxMmQxMjFkZTAwMDFiZDc4ODIiLCJhaWRfZXh0Ijp0cnVlLCJjb21wYW55X2lkIjoiNWMwOThiM2QxNjU0YzEwMDAxMmM2OGY5IiwiaWF0IjoxNzAwMjYwMDY1fQ.HMhQjXZSBt6qoEXwaRSTFKQ9DQ3ewWzkBZWsX20yM8I; purr-cache=<K0<rUS-AZ<C_<G_<S0<a1<ur<T0; nyt-m=49A8B3B23EB045653B22EA7F5447E91E&iub=i.0&iru=i.1&ier=i.0&ira=i.0&e=i.1704117600&n=i.2&rc=i.0&imu=i.1&prt=i.0&iga=i.0&ifv=i.0&igd=i.0&iir=i.0&t=i.0&vr=l.4.0.0.0.0&pr=l.4.0.0.0.0&cav=i.0&ica=i.0&s=s.crosswords&imv=i.0&uuid=s.00c10442-f93e-455d-8bd8-d9fefa6829f4&g=i.0&er=i.1702081705&vp=i.0&igu=i.1&iue=i.1&v=i.0&ft=i.0&ird=i.0&fv=i.0&igf=i.0; nyt-gdpr=0; nyt-geo=US; b2b_cig_opt=%7B%22isCorpUser%22%3Afalse%7D; edu_cig_opt=%7B%22isEduUser%22%3Afalse%7D; _cb_svref=https%3A%2F%2Fwww.nytimes.com%2Fcrosswords%2Fgame%2Fdaily%2F2019%2F12%2F16; __gads=ID=425232c3d34af324:T=1700260023:RT=1702334083:S=ALNI_MbXXJb77urovDxsEy9D_laAYG21lA; __gpi=UID=00000da26e824563:T=1700260023:RT=1702334083:S=ALNI_MYKSrGt_IWb1Ok3VdmRunTYPxXKaQ; datadome=faZZS5AIxch9RFF39BpsvFGwjiDNmtqstHR2z4I1wX64MjNh2C2smodHoPtiZgGB8Q_kjcIbFlQ21awxG6cxZvVCwdNhhEFGmKad06ySiUdRMj2RjeZRSap9weP7EIDU; nyt-jkidd=uid=137255990&lastRequest=1702334093702&activeDays=%5B0%2C0%2C0%2C0%2C0%2C1%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C1%2C1%2C1%2C1%2C1%2C1%2C0%2C1%5D&adv=8&a7dv=6&a14dv=7&a21dv=7&lastKnownType=sub&newsStartDate=&entitlements=CKG+XWD; _chartbeat2=.1700260023316.1702334093806.0000000111111001.Bcl0YRpdOX0C9fjeuDTnHH6DpDSIK.2; NYT-S=0^CBYSLwiU0t-qBhCrqN6rBhoSMS3zZlvRaA6HPf8X0r9bANX_ILa4uUEqAgAGON-26_cFGkCnoc4WfNK--ziLIOgiaNTkZ3hqU588bAUwKe89zLHKAvgdH9wMbesyMoilJcJS6-z9aF5NPyZYV38X4zF_uBIG; SIDNY=CBYSLwiU0t-qBhCrqN6rBhoSMS3zZlvRaA6HPf8X0r9bANX_ILa4uUEqAgAGON-26_cFGkCnoc4WfNK--ziLIOgiaNTkZ3hqU588bAUwKe89zLHKAvgdH9wMbesyMoilJcJS6-z9aF5NPyZYV38X4zF_uBIG"
//             }
//         };


//         await new Promise((resolve, reject) => {
//             https.get(options, (res) => {
//                 let data = '';

//                 // A chunk of data has been received.
//                 res.on('data', (chunk) => {
//                     data += chunk;
//                 });

//                 // The whole response has been received.
//                 res.on('end', () => {
//                     console.log(parse(JSON.parse(data)))
//                     console.log(',')
//                     resolve(parse(JSON.parse(data)));
//                 });
//             }).on("error", (err) => {
//                 console.error("Error: " + err.message);
//                 reject(err);
//             });
//         });
//     }
// }

// // Example usage
// console.log(fetchPuzzles(getPastMondays(30))); // Add your dates here


// // // fetch("https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/2023-09-11.json", {
// // //   "headers": {
// // //     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
// // //     "accept-language": "en-US,en;q=0.9",
// // //     "cache-control": "max-age=0",
// // //     "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
// // //     "sec-ch-ua-mobile": "?0",
// // //     "sec-ch-ua-platform": "\"macOS\"",
// // //     "sec-fetch-dest": "document",
// // //     "sec-fetch-mode": "navigate",
// // //     "sec-fetch-site": "none",
// // //     "sec-fetch-user": "?1",
// // //     "upgrade-insecure-requests": "1",
// // //     "cookie": "nyt-a=hqgI8x1BoiKrSPaw4xp-nH; _gcl_au=1.1.1313786748.1700259974; nyt-purr=cfshcfhssckfsdfhh; _cb=DPKuV-BPEzW9CNlLv4; nyt-b3-traceid=52daa7f72a0e4ebe96a7c79e12b3f194; iter_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiI2MTc3NmYxMmQxMjFkZTAwMDFiZDc4ODIiLCJhaWRfZXh0Ijp0cnVlLCJjb21wYW55X2lkIjoiNWMwOThiM2QxNjU0YzEwMDAxMmM2OGY5IiwiaWF0IjoxNzAwMjYwMDY1fQ.HMhQjXZSBt6qoEXwaRSTFKQ9DQ3ewWzkBZWsX20yM8I; purr-cache=<K0<rUS-AZ<C_<G_<S0<a1<ur<T0; nyt-m=49A8B3B23EB045653B22EA7F5447E91E&iub=i.0&iru=i.1&ier=i.0&ira=i.0&e=i.1704117600&n=i.2&rc=i.0&imu=i.1&prt=i.0&iga=i.0&ifv=i.0&igd=i.0&iir=i.0&t=i.0&vr=l.4.0.0.0.0&pr=l.4.0.0.0.0&cav=i.0&ica=i.0&s=s.crosswords&imv=i.0&uuid=s.00c10442-f93e-455d-8bd8-d9fefa6829f4&g=i.0&er=i.1702081705&vp=i.0&igu=i.1&iue=i.1&v=i.0&ft=i.0&ird=i.0&fv=i.0&igf=i.0; nyt-gdpr=0; nyt-geo=US; b2b_cig_opt=%7B%22isCorpUser%22%3Afalse%7D; edu_cig_opt=%7B%22isEduUser%22%3Afalse%7D; _cb_svref=https%3A%2F%2Fwww.nytimes.com%2Fcrosswords%2Fgame%2Fdaily%2F2019%2F12%2F16; __gads=ID=425232c3d34af324:T=1700260023:RT=1702334083:S=ALNI_MbXXJb77urovDxsEy9D_laAYG21lA; __gpi=UID=00000da26e824563:T=1700260023:RT=1702334083:S=ALNI_MYKSrGt_IWb1Ok3VdmRunTYPxXKaQ; datadome=faZZS5AIxch9RFF39BpsvFGwjiDNmtqstHR2z4I1wX64MjNh2C2smodHoPtiZgGB8Q_kjcIbFlQ21awxG6cxZvVCwdNhhEFGmKad06ySiUdRMj2RjeZRSap9weP7EIDU; nyt-jkidd=uid=137255990&lastRequest=1702334093702&activeDays=%5B0%2C0%2C0%2C0%2C0%2C1%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C1%2C1%2C1%2C1%2C1%2C1%2C0%2C1%5D&adv=8&a7dv=6&a14dv=7&a21dv=7&lastKnownType=sub&newsStartDate=&entitlements=CKG+XWD; _chartbeat2=.1700260023316.1702334093806.0000000111111001.Bcl0YRpdOX0C9fjeuDTnHH6DpDSIK.2; NYT-S=0^CBYSLwiU0t-qBhCrqN6rBhoSMS3zZlvRaA6HPf8X0r9bANX_ILa4uUEqAgAGON-26_cFGkCnoc4WfNK--ziLIOgiaNTkZ3hqU588bAUwKe89zLHKAvgdH9wMbesyMoilJcJS6-z9aF5NPyZYV38X4zF_uBIG; SIDNY=CBYSLwiU0t-qBhCrqN6rBhoSMS3zZlvRaA6HPf8X0r9bANX_ILa4uUEqAgAGON-26_cFGkCnoc4WfNK--ziLIOgiaNTkZ3hqU588bAUwKe89zLHKAvgdH9wMbesyMoilJcJS6-z9aF5NPyZYV38X4zF_uBIG"
// // //   },
// // //   "referrerPolicy": "strict-origin-when-cross-origin",
// // //   "body": null,
// // //   "method": "GET"
// // // });
