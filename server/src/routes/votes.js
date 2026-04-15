const express = require('express');
const router = express.Router();
const { authUser } = require('../middleware/auth');
const {
  getPublicVotes, getVoteByToken, castVote, castPublicVote, getUserVoteHistory,
  getVoteLeaderboard, resolveVotingLink, resolveOptionToken,
} = require('../controllers/voteController');

router.get('/', authUser, getPublicVotes);
router.get('/token/:token', getVoteByToken);
router.get('/option/:optionToken', resolveOptionToken);
router.get('/voting-link/:token', resolveVotingLink);
router.post('/cast/public', castPublicVote);
router.post('/cast', authUser, castVote);
router.get('/history', authUser, getUserVoteHistory);
router.get('/:id/leaderboard', getVoteLeaderboard);

module.exports = router;
