var NasPredictContract = function() {
  // Data stored by the smart contract
  LocalContractStorage.defineMapProperty(this, "user_to_id")
  LocalContractStorage.defineMapProperty(this, "id_to_message")
  LocalContractStorage.defineProperty(this, "user_count")
}

NasPredictContract.prototype = {
  // init is called once, when the contract is deployed.
  init: function() {
    this.user_count = 1; // The first id should be 1 (not 0)
  },

  // If the user is new: Add a new message to the system
  // Else: Update their existing message
  postPrediction: function (new_user_message) {
    if(Blockchain.transaction.value != 0) { // Users only pay the gas fee.
        throw new Error("I don't want your money.");
    }
    
    var user_id = this.user_to_id.get(Blockchain.transaction.from);
    if(!user_id) {
      // First message from this user, assign a new ID
      user_id = this.user_count;
      this.user_count++;
      this.user_to_id.put(Blockchain.transaction.from, user_id);
    }

    var today = new Date();

    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    new_user_message += "   [User Address - " + Blockchain.transaction.from + 
                        ",   Date of prediction - " + dateTime + " UTC]"

    this.id_to_message.put(user_id, new_user_message);
  },

  getMyPrediction: function () {
    var user_id = this.user_to_id.get(Blockchain.transaction.from);
    if(user_id) {
      return this.id_to_message.get(user_id);
    }
  },

  getPredictions: function() {
    var messages = [];
    
    for (var i = 0; i < this.user_count; i++) {
      var message = this.id_to_message.get(i);
      messages.push(message);
    }

    return messages
  },

  getUserCount: function() {
    return this.user_count
  },

  getPredictionData: function (public_address) {
    var user_id = this.user_to_id.get(public_address)
    if(user_id) {
      return this.id_to_message.get(user_id);
    }
  }
}

module.exports = NasPredictContract
