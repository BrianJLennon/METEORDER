PlayersList = new Mongo.Collection('players');

if (Meteor.isServer) {

    Meteor.methods({
        'insertPlayerData': function(playerNameVar) {
            var currentUserId = Meteor.userId();
            PlayersList.insert({
                name: playerNameVar,
                score: 0,
                createdBy: currentUserId
            });
        },
        'removePlayerData': function(selectedPlayer) {
            var currentUserId = Meteor.userId();
            PlayersList.remove({
                _id: selectedPlayer,
                createdBy: currentUserId
            });
        },
        'modifyPlayerScore': function(selectedPlayer, scoreValue) {
            var currentUserId = Meteor.userId();
            PlayersList.update({
                _id: selectedPlayer,
                createdBy: currentUserId
            }, {
                $inc: {
                    score: scoreValue
                }
            });
        }
    });

    Meteor.publish('thePlayers', function() {
        var currentUserId = this.userId;
        return PlayersList.find({
            createdBy: currentUserId
        })
    });
}

if (Meteor.isClient) {
    Meteor.subscribe('thePlayers');
    Template.leaderboard.helpers({
        'player': function() {
            var currentUserId = Meteor.userId();
            return PlayersList.find({}, {
                sort: {
                    score: -1,
                    name: 1
                }
            });
        },
        'selectedClass': function() {
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');
            if (playerId == selectedPlayer) {
                return "selected"
            }
        },
        'showSelectedPlayer': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne(selectedPlayer)
        }
    });

    Template.leaderboard.events({
        'click .player': function() {
            var playerId = this._id;
            Session.set('selectedPlayer', playerId);
        },
        'click .increment': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('modifyPlayerScore', selectedPlayer, 5);
        },
        'click .decrement': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('modifyPlayerScore', selectedPlayer, -5);
        },
        'click .remove': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('removePlayerData', selectedPlayer);
        }
    });

    Template.addPlayerForm.events({
        'submit form': function(event) {
            event.preventDefault();
            var playerNameVar = event.target.playerName.value;
            var playerScoreVar = parseInt(event.target.playerScore.value, 10);
            Meteor.call('insertPlayerData', playerNameVar);
            var currentUserId = Meteor.userId();
            PlayersList.insert({
                name: playerNameVar,
                score: playerScoreVar,
                createdBy: currentUserId
            });

            event.target.playerName.value = "";
            event.target.playerScore.value = "";
        }
    });

}