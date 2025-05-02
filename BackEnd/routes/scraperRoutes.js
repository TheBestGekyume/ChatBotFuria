const express = require('express');
const router = express.Router();
const getLineUp = require('../controllers/scraper/getLineUp');
const getUpcomingMatches = require('../controllers/scraper/getUpcomingMatches');
const getPastMatches = require('../controllers/scraper/getPastMatches');


router.get('/lineup', getLineUp);
router.get('/upcoming', getUpcomingMatches);
router.get('/pastmatches', getPastMatches);


module.exports = router;
