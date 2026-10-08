const express = require('express');
const router = express.Router();
const {
  startPitch,
  evaluateAnswer,
  finalVerdict,
  getHint,
  dealMeter,
} = require('../controllers/pitchController');

router.post('/start-pitch', startPitch);
router.post('/evaluate-answer', evaluateAnswer);
router.post('/final-verdict', finalVerdict);
router.post('/hint', getHint);
router.post('/deal-meter', dealMeter);

module.exports = router;
