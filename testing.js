const {PubgAPI} = require('pubg.op.gg');
const api = new PubgAPI();

const {MATCH, SEASON, REGION} = require('pubg.op.gg');

//getProfileByID(playerid, season, server, queuesize, mode)
api.getProfileByID('59fdabfb33bd730001661ad2', SEASON.RE2018sea1, REGION.EU, MATCH.SQUAD.size, MATCH.SQUADFPP.name)
  .then((profile) => {
    var stats       = profile.getStats();
  	var top10rating = (stats.topten_matches_cnt / stats.matches_cnt) * 100;
  	var winrating   = (stats.win_matches_cnt / stats.matches_cnt) * 100;
	var kda         = (stats.kills_sum + stats.assists_sum) / stats.deaths_sum;
  	var ranking     = 1000 * (1+(((winrating*2)*0.75 + (top10rating*2)*0.25)/100)) *  (1+((kda/2)/100)) * (1 + (stats.damage_dealt_avg/2)/100);

  	console.log("New ELO:" + ranking);
  }).catch((error) => {
  	console.error(error);
  });