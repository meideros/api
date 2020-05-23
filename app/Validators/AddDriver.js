'use strict'

class AddDriver {
  get rules () {
    return {
      firstName: 'required|alpha',
      lastName: 'required|alpha',
      address: 'required|alpha',
      phoneNumber: 'required'
    }
  }
  get messages () {
    return {
      'required': 'Merci de renseigner tous les champs',
      'lastName.alpha': 'Nom invalide',
      'firstName.alpha': 'Prénom invalide',
    }
    
  }
  async fails (errorMessages) {
    return this.ctx.response.json({done:false, message: errorMessages[0].message})
  }
}

module.exports = AddDriver
