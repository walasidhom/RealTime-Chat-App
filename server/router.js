const express = require('express');
const router = express.Router();

//create router
router.get('/', (req, res) => {
    res.send('server is up and running');
})
 
//export router
module.exports = router;