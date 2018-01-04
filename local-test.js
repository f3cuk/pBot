var filename = `./servers/pubg/222979003869429761.json`;
var props = require(filename);

for(var attributename in props["ranking"]){
    console.log(attributename+": "+props["ranking"][attributename]);
}