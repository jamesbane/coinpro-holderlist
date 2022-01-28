var express = require('express');
const axios = require('axios');
var router = express.Router();
var timeout = require('connect-timeout');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function getResponse(apiUrl) {
    let response = await axios.get(apiUrl);
    return response.data;
}
/* GET home page. */
router.get('/holderlist/:address/:page/:type', async function(req, res, next) {
    const tokenAddress = req.params.address;
    const itemType = req.params.type;
    const page = req.params.page;
    let results = [];
    console.log(page);
    let apiurl = `https://bscscan.com/token/generic-tokenholders2?a=${tokenAddress}&sid=&m=1&p=${page}`;
    if (itemType === 'eth') {
        apiurl = `https://etherscan.io/token/generic-tokenholders2?a=${tokenAddress}&sid=&m=1&p=${page}`;
    }
    let response = '';
    try {
        response = await getResponse(apiurl);
        const dom = new JSDOM(response);

        const childNodes = dom.window.document.querySelector('#maintable table tbody').children;
        for (let k = 0; k < childNodes.length; k++) {
            const holder =  childNodes[k];
            const rank = holder.children[0].textContent;
            const address = holder.children[1].querySelector('a').getAttribute('href');
            const tag = holder.children[1].textContent;
            const balance = holder.children[2].textContent.replace(/,/g, '');
            results.push({
                rank: rank,
                address,
                tag: tag,
                balance: balance
            })
        }
    } catch (e) {
        console.log('error', e.message);
        return res.status(200).send({
            status: 'error',
            data: results,
            message: e.message,
        });
    }

    console.log('success');
    return res.status(200).send({
        status: 'success',
        data: results
    })
});



function haltOnTimedout (req, res, next) {
    console.log('timeout');
    if (!req.timedout) next()
}


module.exports = router;
