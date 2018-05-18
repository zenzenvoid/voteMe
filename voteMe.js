"use strict";

var VoteItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.candidate = obj.candidate; // for whom are we voting
        this.election = obj.election; // which election
    }
    else {
        this.candidate = "";
        this.election = "";
    };
};

VoteItem.prototype = {
    toString : function() {
        return JSON.stringify(this);
    }
};


var ElectionItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.number = new BigNumber(obj.number); // order of the candidate
        this.election = obj.election; // which election
    }
    else {
        this.number = new BigNumber(0);
        this.election = "";
    };
};

ElectionItem.prototype = {
    toString : function() {
        return JSON.stringify(this);
    }
};


var VoteMe = function() {
	LocalContractStorage.defineMapProperty(this, "elections");
	LocalContractStorage.defineMapProperty(this, "votes");
	LocalContractStorage.defineMapProperty(this, "candidates");
}

VoteMe.prototype = {
    init: function() {},
    
    vote: function(election, candidate) {
        candidate = candidate.trim();
        election = election.trim();
        if (candidate === "" || election === "") {
            throw new Error("candidate or election empty");
        }
        
        if (candidate.length > 64 || election.length > 64){
            throw new Error("string exceeds limit length")
        }

		var voteItem = new VoteItem();
		voteItem.election = election;
		voteItem.candidate = candidate;
        
		var votes = this.votes.get(voteItem);
        if (votes) {
			votes = new BigNumber(votes).plus(1);
        }
        else {
            voteItem = new VoteItem();
            voteItem.candidate = candidate;
            voteItem.election = election;
			votes = new BigNumber(1);
			
			var n = this.elections.get(election);
			//is it a new or existing election?
			if (n) { //existing election, new candidate
				n = new BigNumber(n).plus(1);
			}
			else { //new election, first candidate
				n = new BigNumber(1);
			}
			this.elections.put(election, n);
            
			var electionItem = new ElectionItem();
            electionItem.election = election;
			electionItem.number = n;
			this.candidates.put(electionItem, candidate);
        }
        
        this.votes.put(voteItem, votes);
    },
    
    getVotes: function(election, candidate) {
        election = election.trim();
		candidate = candidate.trim();
        if (election === "" || candidate === "") {
            throw new Error("empty key");
        }
        var voteItem = new VoteItem();
		voteItem.election = election;
		voteItem.candidate = candidate;
		
		var votes = this.votes.get(voteItem);
		if (votes) {
			return +votes;			
		}
		else {
			throw new Error("no such candidate in the given election");
		}
    },
	
    getCandidate: function(election, number) {
        election = election.trim();
        if (election === "") {
            throw new Error("empty key");
        }
					
        var electionItem = new ElectionItem();
		electionItem.election = election;
		electionItem.number = new BigNumber(number);
		return this.candidates.get(electionItem);
    },

	getCandidateCount(election) {
		election = election.trim();
		return +this.elections.get(election);
	}
};

module.exports = VoteMe;